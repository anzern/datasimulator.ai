// ... (imports remain same)
import React, { useState, useEffect, useMemo } from "react";
import { COMPANIES } from "./constants";
import { aiService } from "./services/ai";
import { persistenceService } from "./services/persistence";
import { Task, CompanyType, BrandAssets, UserMetrics, UserState } from "./types";
import Onboarding from "./views/Onboarding";
import Board from "./views/Board";
import TaskDetail from "./views/TaskDetail";
import SignIn from "./views/SignIn";
import Profile from "./views/Profile";
import HelpCenter from "./views/HelpCenter";
import { Loader2, AlertCircle } from "lucide-react";

type ViewState = 'signin' | 'onboarding' | 'board' | 'detail' | 'profile' | 'help';

const App = () => {
  // Global State
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [userUid, setUserUid] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  
  // Workspace State
  const [activeCompany, setActiveCompany] = useState<CompanyType | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // View State
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [view, setView] = useState<ViewState>('signin');
  
  // Loading States
  const [loading, setLoading] = useState(false); // General loading
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [brandAssets, setBrandAssets] = useState<BrandAssets>({});

  // --- 1. SESSION RESTORE ---
  
  const restoreUserSession = async (user: UserState) => {
    setUserUid(user.uid);
    setUserEmail(user.email);
    setUserName(user.name || "");
    setMetrics(user.metrics || null);
    
    if (user.companyId) {
         // Auto-load workspace if user was in one
         // Pass user.uid explicitly because state update setUserUid is async
         await handleSwitchWorkspace(user.companyId, false, user.uid); 
         
         if (user.lastActiveView) {
             setView(user.lastActiveView as ViewState);
         } else {
             setView('board');
         }
    } else {
        setView('onboarding');
    }
  };

  useEffect(() => {
    const safetyTimer = setTimeout(() => {
        setIsSessionLoading((prev) => {
            if (prev) {
                console.warn("Session load timeout - forcing Sign In view");
                return false;
            }
            return prev;
        });
    }, 4000);

    persistenceService.getBrandAssets().then(assets => {
        if (assets) setBrandAssets(assets);
        else generateBrandAssets();
    });

    const unsubscribe = persistenceService.onAuthStateChanged(async (firebaseUser) => {
        if (firebaseUser) {
            setIsSessionLoading(true);
            try {
                const user = await persistenceService.syncUser(firebaseUser);
                await restoreUserSession(user);
            } catch (e) {
                console.error("Failed to sync user session", e);
                handleSignOut();
            } finally {
                setIsSessionLoading(false);
            }
        } else {
            setView('signin');
            setIsSessionLoading(false);
        }
    });

    return () => {
        unsubscribe();
        clearTimeout(safetyTimer);
    }
  }, []);

  const generateBrandAssets = async () => {
     try {
        const [logo, banner] = await Promise.all([
            aiService.generateImage("A modern tech logo symbol. A glossy cyan and blue gradient circle with a bold white letter 'D' in the center. Small network nodes connected to the main circle. Dark deep navy blue background. Vector art style, high definition", "1:1"),
            aiService.generateImage("A cinematic background in deep navy blue. Network nodes and molecules glowing in cyan and teal, connecting to form a digital brain or data structure. Minimalist, futuristic, high definition, wide angle", "16:9")
        ]);
        
        if (logo || banner) {
            const newAssets = { logoUrl: logo || undefined, bannerUrl: banner || undefined };
            setBrandAssets(newAssets);
            await persistenceService.saveBrandAssets(newAssets);
        }
     } catch (e) {
        console.error("Asset generation failed", e);
     }
  };

  // --- 2. WORKSPACE HANDLERS ---

  const handleSwitchWorkspace = async (companyId: string, showLoading = true, overrideUid?: string) => {
    const targetUid = overrideUid || userUid;
    if (!targetUid) {
        console.warn("Attempted to switch workspace without User UID");
        return;
    }

    const company = COMPANIES.find(c => c.id === companyId);
    if (!company) return;

    if (showLoading) setLoading(true);
    
    try {
        // Load Global Projects + User Progress
        const { projects, userState } = await persistenceService.getCompanyWorkspace(targetUid, companyId);
        
        // Ensure state is updated atomically where possible before view switch
        setActiveCompany(company);
        setTasks(projects);
        setMetrics(userState.metrics || null);
        
        // Restore active task if in detail view
        if (userState.lastActiveTaskId) {
             const findActive = (list: Task[]): Task | undefined => {
                 for (const t of list) {
                     if (t.id === userState.lastActiveTaskId) return t;
                     if (t.relatedTasks) {
                         const found = findActive(t.relatedTasks);
                         if (found) return found;
                     }
                 }
             };
             const active = findActive(projects);
             if (active) setCurrentTask(active);
        }

        if (showLoading) setView('board');
    } catch (e) {
        console.error("Workspace switch failed", e);
    } finally {
        if (showLoading) setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await persistenceService.logout();
    setUserUid(null);
    setUserEmail(null);
    setUserName("");
    setActiveCompany(null);
    setTasks([]);
    setMetrics(null);
    setCurrentTask(null);
    setView('signin');
  };

  // --- 3. TASK HANDLERS (UPDATED FOR GLOBAL/USER SPLIT) ---

  // Helper to deep update local state to reflect UI changes optimistically
  // Note: PersistenceService handles the backend, this is for React responsiveness
  const optimisticUpdate = (targetId: string, updateFn: (t: Task) => Task) => {
      const updateTree = (list: Task[]): Task[] => {
          return list.map(t => {
              if (t.id === targetId) return updateFn(t);
              if (t.relatedTasks) {
                  return { ...t, relatedTasks: updateTree(t.relatedTasks) };
              }
              return t;
          });
      };
      const newTasks = updateTree(tasks);
      setTasks(newTasks);
      
      // Also update currentTask reference if it matches
      if (currentTask) {
          if (currentTask.id === targetId) setCurrentTask(updateFn(currentTask));
          else if (currentTask.relatedTasks) {
               // If currentTask is a root and we modified a child, we need to refresh the root's structure
               // But usually we modify the active detail task.
               const updatedCurrent = newTasks.find(t => t.id === currentTask.id);
               if (updatedCurrent) setCurrentTask(updatedCurrent);
          }
      }
  };

  const handleTaskClick = async (task: Task) => {
    // We only set the view here. Data loading is handled by the TaskDetail component
    // on mount. This prevents race conditions and ensures "auto-load" logic is centralized.
    setCurrentTask(task);
    setView('detail');
    if (userUid) persistenceService.saveUser(userUid, { lastActiveView: 'detail', lastActiveTaskId: task.id });
  };

  // Loads details for nested items
  const handleLoadDetails = async (targetTaskId: string) => {
      // Prevent double-loading if already in progress
      if (loadingDetails) return;

      // We need activeCompany to generate details
      if (!activeCompany) {
          console.error("Cannot load details: No active company");
          return;
      }
      
      // Helper to find task in state
      const findTask = (list: Task[]): Task | undefined => {
          for (const t of list) {
              if (t.id === targetTaskId) return t;
              if (t.relatedTasks) {
                  const res = findTask(t.relatedTasks);
                  if (res) return res;
              }
          }
      };
      
      let target = findTask(tasks); 
      
      // Fallback: If not found in tree (rare race condition), check if it matches currentTask
      if (!target && currentTask && currentTask.id === targetTaskId) {
          target = currentTask;
      }

      if (!target) {
          console.warn("Target task not found for detail loading:", targetTaskId);
          return;
      }
      
      if (target.detailsLoaded) return;

      setLoadingDetails(true);
      try {
        const detailedSubTask = await aiService.generateTaskDetails(activeCompany, target);
        await persistenceService.saveGlobalTaskDetails(activeCompany.id, targetTaskId, detailedSubTask);
        
        optimisticUpdate(targetTaskId, (t) => ({ ...t, ...detailedSubTask }));
      } catch (e) {
          console.error("Failed to load details", e);
      } finally {
        setLoadingDetails(false);
      }
  };

  const handleCompleteTask = async (taskId: string) => {
    if (!userUid || !activeCompany) return;
    const now = Date.now();
    
    // 1. Optimistic UI
    optimisticUpdate(taskId, t => ({ ...t, isCompleted: true, completedAt: now }));
    
    // 2. Persist Progress
    await persistenceService.updateUserProgress(userUid, taskId, { isCompleted: true, completedAt: now });
    
    // 3. Refresh metrics
    const user = await persistenceService.saveUser(userUid, {}); // Trigger recalc
    setMetrics(user.metrics || null);
  };

  const handleQuizAnswer = async (taskId: string, questionId: string, answer: string) => {
      if (!userUid) return;
      
      // Find current answers
      // We need to fetch from state or assume empty if not present
      let currentAnswers = {};
      
      // Helper to find task in state to get current answers
      const findTask = (list: Task[]): Task | undefined => {
        for (const t of list) {
            if (t.id === taskId) return t;
            if (t.relatedTasks) {
                const res = findTask(t.relatedTasks);
                if (res) return res;
            }
        }
      };
      const t = findTask(tasks);
      if (t) currentAnswers = t.userAnswers || {};

      const newAnswers = { ...currentAnswers, [questionId]: answer };

      optimisticUpdate(taskId, t => ({ ...t, userAnswers: newAnswers }));
      await persistenceService.updateUserProgress(userUid, taskId, { userAnswers: newAnswers });
  };

  const handleStatusToggle = async (taskId: string) => {
      if (!userUid) return;
      // Find current status
      const findTask = (list: Task[]): Task | undefined => {
        for (const t of list) {
            if (t.id === taskId) return t;
            if (t.relatedTasks) {
                const res = findTask(t.relatedTasks);
                if (res) return res;
            }
        }
      };
      const t = findTask(tasks);
      if (!t) return;
      
      const newStatus = !t.isCompleted;
      const now = Date.now();
      
      optimisticUpdate(taskId, t => ({ ...t, isCompleted: newStatus, completedAt: newStatus ? now : undefined }));
      await persistenceService.updateUserProgress(userUid, taskId, { isCompleted: newStatus, completedAt: newStatus ? now : undefined });
  };

  const handleGenerateFollowUp = async (rootTask: Task, contextTask: Task) => {
      if (!activeCompany || !userUid) return;
      
      try {
          const followUp = await persistenceService.createFollowUp(activeCompany.id, contextTask.id);
          
          if (followUp) {
             // Refresh workspace to see new global structure
             const { projects } = await persistenceService.getCompanyWorkspace(userUid, activeCompany.id);
             setTasks(projects);
             
             // Update current view if inside the chain
             if (currentTask && currentTask.id === rootTask.id) {
                 const updatedRoot = projects.find(p => p.id === rootTask.id);
                 if (updatedRoot) setCurrentTask(updatedRoot);
             }
          } else {
              alert("Follow-up limit reached for this task chain (Max 3).");
          }
      } catch (e: any) {
          alert(e.message || "Failed to generate follow-up");
      }
  };

  const handleGenerateSolution = async (taskId: string) => {
      if (!activeCompany || !userUid) return;

      // Find task definition
       const findTask = (list: Task[]): Task | undefined => {
        for (const t of list) {
            if (t.id === taskId) return t;
            if (t.relatedTasks) {
                const res = findTask(t.relatedTasks);
                if (res) return res;
            }
        }
      };
      const target = findTask(tasks);
      if (!target) return;

      const solution = await aiService.generateSolutionWriteup(activeCompany, target);
      
      // Solution is saved GLOBALLY as content
      await persistenceService.saveGlobalTaskDetails(activeCompany.id, taskId, { solutionWriteup: solution });
      optimisticUpdate(taskId, t => ({ ...t, solutionWriteup: solution }));
  };
  
  const handleGenerateMoreTasks = async (difficulty: string) => {
     // This feature would theoretically add to global pool or personal pool.
     // Given the new "Global" architecture, "Generating More" implies adding to the company global board.
     // For now, disabling or treating as 'Personal Addon' is complex.
     // We will treat it as adding to Global Cache for simplicity in this demo.
     if (!activeCompany || !userUid) return;
     
     const newTasks = await aiService.generateAdditionalTasks(activeCompany, difficulty);
     // We need a persistence method to add generic tasks to global store.
     // For this simulated scope, we skip implementing 'addGlobalTask' unless requested, 
     // but to prevent breaking, we just alert.
     alert("Manual task generation is disabled in Global Mode to preserve roadmap integrity.");
  };
  
  // Update name is simple user update
  const handleUpdateName = (name: string) => {
      setUserName(name);
      if (userUid) persistenceService.saveUser(userUid, { name });
  };

  // --- RENDER ---

  if (isSessionLoading) {
      return (
          <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
              <p className="text-slate-500 font-medium animate-pulse">Synchronizing World State...</p>
          </div>
      );
  }

  if (view === 'help') return <HelpCenter onBack={() => { if (userUid) setView('board'); else setView('signin'); }} />;
  if (view === 'signin') return <SignIn brandAssets={brandAssets} onHelpClick={() => setView('help')} />;
  if (view === 'onboarding') return <Onboarding onCompanySelect={handleSwitchWorkspace} onBack={handleSignOut} loading={loading} />;
  
  if (view === 'profile' && userEmail && userUid) {
    // Aggregating all tasks from all workspaces for stats is expensive in this new model
    // We will rely on 'metrics' which are pre-calculated.
    return (
      <Profile 
        email={userEmail}
        name={userName}
        metrics={metrics}
        activeCompany={activeCompany}
        tasks={tasks} // Current workspace tasks only for list
        brandAssets={brandAssets}
        onBack={() => setView('board')}
        onUpdateName={handleUpdateName}
        onSwitchWorkspace={handleSwitchWorkspace}
      />
    );
  }

  if (view === 'board' && activeCompany && userUid) {
    return (
      <Board 
        tasks={tasks} 
        activeCompany={activeCompany} 
        userEmail={userEmail || ""}
        userName={userName}
        onTaskClick={handleTaskClick}
        onSignOut={handleSignOut}
        onProfileClick={() => setView('profile')}
        onStatusToggle={handleStatusToggle}
        onDueDateChange={(id, date) => { /* Dates are global, typically read-only in this mode */ }}
        onGenerateMore={handleGenerateMoreTasks}
        onHelpClick={() => setView('help')}
      />
    );
  }

  if (view === 'detail' && currentTask && activeCompany) {
    return (
      <TaskDetail 
        task={currentTask} 
        activeCompany={activeCompany} 
        loadingDetails={loadingDetails}
        onBack={() => { setView('board'); persistenceService.saveUser(userUid!, { lastActiveView: 'board' }); }}
        onComplete={handleCompleteTask}
        onQuizAnswerChange={handleQuizAnswer}
        onGenerateFollowUp={handleGenerateFollowUp}
        onGenerateSolution={handleGenerateSolution}
        onLoadDetails={handleLoadDetails}
      />
    );
  }

  // Fallback for weird states
  return (
     <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
         <AlertCircle className="w-10 h-10 text-slate-400 mb-4" />
         <h2 className="text-xl font-bold text-slate-700">Something went wrong</h2>
         <p className="text-slate-500 mb-6 max-w-md mt-2">
             We couldn't load the requested view. This usually happens if the project data is incomplete or the session was interrupted.
         </p>
         <button 
            onClick={() => { setView('board'); if (userUid && activeCompany) handleSwitchWorkspace(activeCompany.id); else setView('signin'); }}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
         >
             Return to Dashboard
         </button>
     </div>
  );
};

export default App;