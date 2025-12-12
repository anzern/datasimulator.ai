import { UserState, Task, BrandAssets, UserMetrics, TaskProgress, CompanyType } from '../types';
import { aiService } from './ai';
import { COMPANIES } from '../constants';

// --- CONFIGURATION ---
const STORE_USERS = 'users';
const STORE_COMPANIES = 'companies'; // GLOBAL CACHE: companies/{companyId}/projects
const STORE_ASSETS = 'global_assets';
const MOCK_USER_KEY = 'dss_mock_user';

// --- METRIC CALCULATION ENGINE ---
const calculateMetrics = (progress: Record<string, TaskProgress>, allTasks: Task[]): UserMetrics => {
  const completedIds = Object.keys(progress).filter(k => progress[k].isCompleted);
  // Create a map for fast lookup of task definition
  const taskMap = new Map(allTasks.map(t => [t.id, t]));
  
  // Helper to find task even if nested (Flat map logic would be better pre-calculated, but this is robust)
  // For calculation, we only need the definition of completed tasks.
  const completedTasks: Task[] = [];
  
  // Flatten all tasks for lookup (Naive but works for size < 1000)
  const flatten = (list: Task[]): Task[] => {
      let flat: Task[] = [];
      list.forEach(t => {
          flat.push(t);
          if (t.relatedTasks) flat.push(...flatten(t.relatedTasks));
      });
      return flat;
  };
  const flatAll = flatten(allTasks);
  const flatMap = new Map(flatAll.map(t => [t.id, t]));

  completedIds.forEach(id => {
      const def = flatMap.get(id);
      if (def) completedTasks.push(def);
  });

  const hoursMap = { Easy: 2, Medium: 5, Hard: 10 };
  const experienceHours = completedTasks.reduce((acc, t) => acc + (hoursMap[t.difficulty as keyof typeof hoursMap] || 2), 0);

  const scoreMap = { Easy: 5, Medium: 10, Hard: 20 };
  const techKeywords = ['ml', 'machine learning', 'ai', 'airflow', 'docker', 'kubernetes', 'dbt', 'pipeline', 'engineering', 'vision', 'nlp'];
  const impactScore = completedTasks.reduce((acc, t) => {
    let base = scoreMap[t.difficulty as keyof typeof scoreMap] || 5;
    const isTech = t.skills.some(s => techKeywords.some(k => s.toLowerCase().includes(k)));
    if (isTech) base += 5;
    return acc + base;
  }, 0);

  const history: Record<string, number> = {};
  const dates = new Set<string>();
  
  completedIds.forEach(id => {
    const p = progress[id];
    if (p && p.completedAt) {
        const date = new Date(p.completedAt).toISOString().split('T')[0];
        history[date] = (history[date] || 0) + 1;
        dates.add(date);
    }
  });

  const sortedDates = Array.from(dates).sort();
  let currentStreak = 0;
  let longestStreak = 0;
  let activeDays = sortedDates.length;

  if (sortedDates.length > 0) {
     let tempStreak = 1;
     for (let i = 1; i < sortedDates.length; i++) {
        const prev = new Date(sortedDates[i-1]);
        const curr = new Date(sortedDates[i]);
        const diff = (curr.getTime() - prev.getTime()) / (1000 * 3600 * 24);
        
        if (diff < 2.0) { 
           tempStreak++;
        } else {
           longestStreak = Math.max(longestStreak, tempStreak);
           tempStreak = 1;
        }
     }
     longestStreak = Math.max(longestStreak, tempStreak);

     const lastDate = new Date(sortedDates[sortedDates.length - 1]);
     const today = new Date();
     lastDate.setHours(0,0,0,0);
     today.setHours(0,0,0,0);
     
     const diffToday = (today.getTime() - lastDate.getTime()) / (1000 * 3600 * 24);
     if (diffToday <= 1) { 
         currentStreak = tempStreak;
     } else {
         currentStreak = 0;
     }
  }

  const xpMap = { Easy: 20, Medium: 40, Hard: 80 };
  const taskXP = completedTasks.reduce((acc, t) => acc + (xpMap[t.difficulty as keyof typeof xpMap] || 20), 0);
  const streakXP = activeDays * 10;
  const xp = taskXP + streakXP;

  let level: UserMetrics['level'] = 'Junior';
  if (xp >= 1500) level = 'Senior';
  else if (xp >= 500) level = 'Intermediate';

  const achievements: string[] = [];
  if (completedTasks.length >= 1) achievements.push('first_task');
  if (completedTasks.length >= 10) achievements.push('ten_tasks');
  if (completedTasks.some(t => t.difficulty === 'Hard')) achievements.push('first_hard');
  if (currentStreak >= 7) achievements.push('seven_day_streak');
  // Simplification: Check if 19 unique base IDs are completed
  if (completedTasks.length >= 19) achievements.push('roadmap_complete');

  return {
    experienceHours,
    impactScore,
    achievements,
    currentStreak,
    longestStreak,
    lastActivityDate: sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null,
    contributionHistory: history,
    xp,
    level
  };
};

// --- FALLBACK LOCAL ENGINE (IndexedDB) ---
class IndexedDBEngine {
  private dbPromise: Promise<IDBDatabase>;
  private dbName = 'DataSimulatorDB_v2'; // Version bump for schema change

  constructor() {
    this.dbPromise = this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject("IndexedDB not supported");
        return;
      }
      const request = window.indexedDB.open(this.dbName, 1);
      request.onerror = () => reject(request.error);
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_USERS)) db.createObjectStore(STORE_USERS, { keyPath: 'uid' });
        if (!db.objectStoreNames.contains(STORE_ASSETS)) db.createObjectStore(STORE_ASSETS, { keyPath: 'id' });
        if (!db.objectStoreNames.contains(STORE_COMPANIES)) db.createObjectStore(STORE_COMPANIES, { keyPath: 'id' });
      };
      request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
    });
  }

  private async getStore(storeName: string, mode: IDBTransactionMode) {
    const db = await this.dbPromise;
    return db.transaction(storeName, mode).objectStore(storeName);
  }

  async get<T>(storeName: string, key: string): Promise<T | undefined> {
    const store = await this.getStore(storeName, 'readonly');
    return new Promise((resolve) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(undefined); 
    });
  }

  async put<T>(storeName: string, value: T): Promise<void> {
    const store = await this.getStore(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.put(value);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
}

// --- MAIN PERSISTENCE SERVICE ---
class PersistenceService {
  private localEngine: IndexedDBEngine;
  private mockUser: any | null = null;
  private listeners: ((user: any | null) => void)[] = [];

  constructor() {
    this.localEngine = new IndexedDBEngine();
    console.log("💿 DataSimulator Persistence (Global Cache Enabled)");

    const stored = localStorage.getItem(MOCK_USER_KEY);
    if (stored) {
        try {
            this.mockUser = JSON.parse(stored);
        } catch (e) {
            console.error("Failed to parse mock user", e);
        }
    }
  }

  // --- AUTH ---
  private notifyListeners(user: any | null) {
      this.mockUser = user;
      if (user) localStorage.setItem(MOCK_USER_KEY, JSON.stringify(user));
      else localStorage.removeItem(MOCK_USER_KEY);
      this.listeners.forEach(l => l(user));
  }

  async signIn(email: string, pass?: string): Promise<void> {
    const uid = 'local-' + btoa(email);
    const user = { uid, email, displayName: email.split('@')[0], photoURL: null };
    
    // Init User State if needed
    const existing = await this.localEngine.get<UserState>(STORE_USERS, uid);
    if (!existing) {
        await this.initUser(user.uid, user.email, user.displayName);
    }
    this.notifyListeners(user);
  }

  async logout(): Promise<void> {
    this.notifyListeners(null);
  }

  onAuthStateChanged(callback: (user: any | null) => void) {
      this.listeners.push(callback);
      setTimeout(() => callback(this.mockUser), 0);
      return () => { this.listeners = this.listeners.filter(l => l !== callback); };
  }

  async syncUser(firebaseUser: any): Promise<UserState> {
    const existing = await this.localEngine.get<UserState>(STORE_USERS, firebaseUser.uid);
    if (existing) {
        existing.lastLogin = Date.now();
        await this.localEngine.put(STORE_USERS, existing);
        return existing;
    }
    return this.initUser(firebaseUser.uid, firebaseUser.email, firebaseUser.displayName);
  }

  private async initUser(uid: string, email: string, name: string): Promise<UserState> {
      const newUser: UserState = {
        uid, email, name,
        companyId: '',
        createdAt: Date.now(),
        lastLogin: Date.now(),
        progress: {}, // Empty progress
        metrics: {
            experienceHours: 0, impactScore: 0, achievements: [], 
            currentStreak: 0, longestStreak: 0, lastActivityDate: null, 
            contributionHistory: {}, xp: 0, level: 'Junior'
        }
      };
      await this.localEngine.put(STORE_USERS, newUser);
      return newUser;
  }

  // --- GLOBAL PROJECT CACHE SYSTEM ---

  // Fetches workspace: Global Projects + Merged User Progress
  async getCompanyWorkspace(uid: string, companyId: string): Promise<{ projects: Task[], userState: UserState }> {
      // 1. Get User
      const user = await this.localEngine.get<UserState>(STORE_USERS, uid);
      if (!user) throw new Error("User not found");

      // 2. Get Global Projects (Cache Check)
      let globalData = await this.localEngine.get<{ id: string, projects: Task[] }>(STORE_COMPANIES, companyId);
      
      // 3. CACHE MISS: Generate Once
      if (!globalData || !globalData.projects || globalData.projects.length === 0) {
          console.log(`⚡ Generating Global Roadmap for ${companyId}...`);
          const company = COMPANIES.find(c => c.id === companyId);
          if (!company) throw new Error("Invalid Company ID");
          
          const generatedProjects = await aiService.generateRoadmap(company, Date.now());
          globalData = { id: companyId, projects: generatedProjects };
          await this.localEngine.put(STORE_COMPANIES, globalData);
      }

      // 4. Update User Active Company
      if (user.companyId !== companyId) {
          user.companyId = companyId;
          await this.localEngine.put(STORE_USERS, user);
      }

      // 5. Merge Data
      const mergedProjects = this.mergeProjects(globalData.projects, user.progress);
      
      return { projects: mergedProjects, userState: user };
  }

  // Merges Global definitions with User progress
  private mergeProjects(globalProjects: Task[], progress: Record<string, TaskProgress>): Task[] {
      return globalProjects.map(task => {
          // Deep clone to avoid mutating cache reference
          const t = { ...task };
          
          // Apply Progress
          const p = progress[t.id];
          if (p) {
              t.isCompleted = p.isCompleted;
              t.completedAt = p.completedAt;
              t.userAnswers = p.userAnswers;
          }

          // Recursively merge relatedTasks
          if (t.relatedTasks) {
              t.relatedTasks = this.mergeProjects(t.relatedTasks, progress);
          }
          
          return t;
      });
  }

  // Updates User Progress ONLY (does not touch global definition)
  async updateUserProgress(uid: string, taskId: string, updates: Partial<TaskProgress>): Promise<void> {
      const user = await this.localEngine.get<UserState>(STORE_USERS, uid);
      if (!user) return;

      const current = user.progress[taskId] || { taskId, isCompleted: false };
      user.progress[taskId] = { ...current, ...updates };
      
      // Recalculate Metrics (Need all tasks for difficulty/skill context)
      // For metric recalc, we need to load the current company projects to get context
      if (user.companyId) {
          const globalData = await this.localEngine.get<{ projects: Task[] }>(STORE_COMPANIES, user.companyId);
          if (globalData) {
               user.metrics = calculateMetrics(user.progress, globalData.projects);
          }
      }

      await this.localEngine.put(STORE_USERS, user);
      this.notifyListeners(user);
  }

  // --- FOLLOW-UP SYSTEM (GLOBAL WRITE) ---
  
  async createFollowUp(companyId: string, parentTaskId: string): Promise<Task | null> {
      // 1. Load Global Data
      const globalData = await this.localEngine.get<{ id: string, projects: Task[] }>(STORE_COMPANIES, companyId);
      if (!globalData) return null;

      // 2. Find Parent and Check Limits
      let parentTask: Task | null = null;
      
      // Recursive finder helper
      const findTask = (list: Task[]): Task | null => {
          for (const t of list) {
              if (t.id === parentTaskId) return t;
              if (t.relatedTasks) {
                  const found = findTask(t.relatedTasks);
                  if (found) return found;
              }
          }
          return null;
      }

      parentTask = findTask(globalData.projects);
      if (!parentTask) return null;

      // 3. Limit Check
      const existingFollowUps = parentTask.relatedTasks || [];
      if (existingFollowUps.length >= 3) {
          throw new Error("Maximum of 3 follow-up tasks reached for this project.");
      }

      // 4. Generate
      const company = COMPANIES.find(c => c.id === companyId)!;
      console.log(`⚡ Generating Follow-Up for ${parentTask.title}...`);
      const newTasks = await aiService.generateFollowUpTask(company, parentTask.title);
      
      if (newTasks.length === 0) return null;

      const followUp = { 
          ...newTasks[0], 
          isFollowUp: true, 
          parentTaskId: parentTask.id,
          // Ensure defaults
          isCompleted: false, detailsLoaded: false
      };

      // 5. Update Global Store (Mutate structure)
      // We need to re-find the object in the tree to mutate it and save back
      const updateTree = (list: Task[]): boolean => {
          for (let i = 0; i < list.length; i++) {
              if (list[i].id === parentTaskId) {
                  if (!list[i].relatedTasks) list[i].relatedTasks = [];
                  list[i].relatedTasks!.push(followUp);
                  return true;
              }
              if (list[i].relatedTasks) {
                  if (updateTree(list[i].relatedTasks!)) return true;
              }
          }
          return false;
      };

      updateTree(globalData.projects);
      await this.localEngine.put(STORE_COMPANIES, globalData);

      return followUp;
  }

  // --- ASSETS & DETAILS (GLOBAL CACHE) ---
  
  async saveGlobalTaskDetails(companyId: string, taskId: string, details: Partial<Task>): Promise<void> {
      const globalData = await this.localEngine.get<{ id: string, projects: Task[] }>(STORE_COMPANIES, companyId);
      if (!globalData) return;

      const updateTree = (list: Task[]): boolean => {
          for (let i = 0; i < list.length; i++) {
              if (list[i].id === taskId) {
                  list[i] = { ...list[i], ...details, detailsLoaded: true };
                  return true;
              }
              if (list[i].relatedTasks) {
                  if (updateTree(list[i].relatedTasks!)) return true;
              }
          }
          return false;
      };

      if (updateTree(globalData.projects)) {
          await this.localEngine.put(STORE_COMPANIES, globalData);
      }
  }

  async getBrandAssets(): Promise<BrandAssets | null> {
    const ASSET_ID = 'brand_assets';
    const result = await this.localEngine.get<{id: string, assets: BrandAssets}>(STORE_ASSETS, ASSET_ID);
    return result?.assets || null;
  }

  async saveBrandAssets(assets: BrandAssets): Promise<void> {
    const ASSET_ID = 'brand_assets';
    await this.localEngine.put(STORE_ASSETS, { id: ASSET_ID, assets });
  }

  // Fallback for direct user saving (Profile updates)
  async saveUser(uid: string, updates: Partial<UserState>): Promise<UserState> {
      const user = await this.localEngine.get<UserState>(STORE_USERS, uid);
      if (!user) throw new Error("User not found");
      const updated = { ...user, ...updates };
      await this.localEngine.put(STORE_USERS, updated);
      return updated;
  }
}

export const persistenceService = new PersistenceService();