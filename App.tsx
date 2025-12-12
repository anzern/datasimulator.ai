import React, { useState, useEffect, useMemo } from "react";
import { COMPANIES } from "./constants";
import { aiService } from "./services/ai";
import { Task, CompanyType, UserState, BrandAssets } from "./types";
import Onboarding from "./views/Onboarding";
import Board from "./views/Board";
import TaskDetail from "./views/TaskDetail";
import SignIn from "./views/SignIn";
import Profile from "./views/Profile";
import HelpCenter from "./views/HelpCenter";

type ViewState = 'signin' | 'onboarding' | 'board' | 'detail' | 'profile' | 'help';

const App = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [activeCompany, setActiveCompany] = useState<CompanyType | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [workspaces, setWorkspaces] = useState<Record<string, Task[]>>({});
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [view, setView] = useState<ViewState>('signin');
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Persistent Brand Assets (Logo/Banner)
  const [brandAssets, setBrandAssets] = useState<BrandAssets>({});

  useEffect(() => {
    const loadBrandAssets = async () => {
        // Updated key to v2 to force new logo generation
        const stored = localStorage.getItem('ds_brand_assets_v2');
        if (stored) {
            setBrandAssets(JSON.parse(stored));
        } else {
            // Generate assets on first load if not present
            try {
                // Parallel generation
                const [logo, banner] = await Promise.all([
                    // Updated prompt to match "D" logo
                    aiService.generateImage("A modern tech logo symbol. A glossy cyan and blue gradient circle with a bold white letter 'D' in the center. Small network nodes connected to the main circle. Dark deep navy blue background. Vector art style, high definition", "1:1"),
                    // Updated banner prompt
                    aiService.generateImage("A cinematic background in deep navy blue. Network nodes and molecules glowing in cyan and teal, connecting to form a digital brain or data structure. Minimalist, futuristic, high definition, wide angle", "16:9")
                ]);
                
                if (logo || banner) {
                    const newAssets = { logoUrl: logo || undefined, bannerUrl: banner || undefined };
                    setBrandAssets(newAssets);
                    localStorage.setItem('ds_brand_assets_v2', JSON.stringify(newAssets));
                }
            } catch (e) {
                console.error("Failed to generate brand assets", e);
            }
        }
    };
    loadBrandAssets();
  }, []);

  // Centralized Persistence Logic
  const persistState = (
    email: string, 
    data: Partial<UserState>
  ) => {
    const key = `ds_sim_${email}`;
    const existing = localStorage.getItem(key);
    const previousState = existing ? JSON.parse(existing) : {};
    
    const newState: UserState = {
      ...previousState,
      email, // Ensure email is always set
      ...data
    };
    
    localStorage.setItem(key, JSON.stringify(newState));
  };

  const handleSignIn = (email: string) => {
    setUserEmail(email);
    const storedData = localStorage.getItem(`ds_sim_${email}`);
    
    if (storedData) {
      // RESTORE PREVIOUS SESSION
      const parsedData: UserState = JSON.parse(storedData);
      setUserName(parsedData.name || "");
      
      // Migrate legacy data if workspaces doesn't exist but tasks do
      const loadedWorkspaces = parsedData.workspaces || {};
      if (Object.keys(loadedWorkspaces).length === 0 && parsedData.tasks && parsedData.tasks.length > 0 && parsedData.companyId) {
          loadedWorkspaces[parsedData.companyId] = parsedData.tasks;
      }
      setWorkspaces(loadedWorkspaces);

      const company = COMPANIES.find(c => c.id === parsedData.companyId);
      if (company) {
        setActiveCompany(company);
        // Prioritize tasks from workspace map, fall back to tasks array
        setTasks(loadedWorkspaces[company.id] || parsedData.tasks || []);
        
        // Restore specific view state
        if (parsedData.lastActiveView === 'detail' && parsedData.lastActiveTaskId) {
            const currentTasks = loadedWorkspaces[company.id] || parsedData.tasks || [];
            const restoredTask = currentTasks.find((t: Task) => t.id === parsedData.lastActiveTaskId);
            if (restoredTask) {
                setCurrentTask(restoredTask);
                setView('detail');
                return;
            }
        } else if (parsedData.lastActiveView === 'profile') {
            setView('profile');
            return;
        }

        // Default to board if no deep link found
        setView('board');
        return;
      }
    }
    
    // NEW USER -> Onboarding
    setView('onboarding');
  };

  const handleSignOut = () => {
    setUserEmail(null);
    setUserName("");
    setActiveCompany(null);
    setTasks([]);
    setWorkspaces({});
    setCurrentTask(null);
    setView('signin');
  };

  const handleSwitchWorkspace = async (companyId: string) => {
    const company = COMPANIES.find(c => c.id === companyId);
    if (!company || !userEmail) return;

    // 1. Save state of currently active company before switching
    const nextWorkspaces = { ...workspaces };
    if (activeCompany) {
        nextWorkspaces[activeCompany.id] = tasks;
    }
    
    setActiveCompany(company);
    setLoading(true);
    
    try {
      let nextTasks: Task[] = [];
      const now = Date.now();

      // 2. Check if we already have data for the target company
      if (nextWorkspaces[companyId] && nextWorkspaces[companyId].length > 0) {
          nextTasks = nextWorkspaces[companyId];
      } else {
          // 3. If not, generate new roadmap
          nextTasks = await aiService.generateRoadmap(company, now);
          nextWorkspaces[companyId] = nextTasks;
      }
      
      setTasks(nextTasks);
      setWorkspaces(nextWorkspaces);
      
      persistState(userEmail, {
        companyId: company.id,
        tasks: nextTasks,
        workspaces: nextWorkspaces,
        lastActiveView: 'board'
      });
      
      setView('board');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Helper to update tasks list and persist everything
  const updateTasksAndPersist = (updatedTasks: Task[], newView?: ViewState, activeTaskId?: string) => {
    setTasks(updatedTasks);
    
    const updatedWorkspaces = { ...workspaces };
    if (activeCompany) {
        updatedWorkspaces[activeCompany.id] = updatedTasks;
    }
    setWorkspaces(updatedWorkspaces);

    if (userEmail) {
        const potentialView = newView || view;
        let validView: 'board' | 'detail' | 'profile' | undefined;
        
        if (potentialView === 'board' || potentialView === 'detail' || potentialView === 'profile') {
            validView = potentialView;
        }

        persistState(userEmail, {
            tasks: updatedTasks,
            workspaces: updatedWorkspaces,
            ...(validView ? { lastActiveView: validView } : {}),
            lastActiveTaskId: activeTaskId
        });
    }
  };

  const handleUpdateName = (name: string) => {
    setUserName(name);
    if (userEmail) {
      persistState(userEmail, { name });
    }
  };

  const handleTaskClick = async (task: Task) => {
    setCurrentTask(task);
    setView('detail');
    
    if (userEmail) {
        persistState(userEmail, {
            lastActiveView: 'detail',
            lastActiveTaskId: task.id
        });
    }

    if (!task.detailsLoaded && activeCompany) {
      setLoadingDetails(true);
      const detailedTask = await aiService.generateTaskDetails(activeCompany, task);
      
      const updatedTasks = tasks.map(t => t.id === task.id ? detailedTask : t);
      setCurrentTask(detailedTask);
      updateTasksAndPersist(updatedTasks, 'detail', task.id);
      setLoadingDetails(false);
    }
  };

  const handleBackToBoard = () => {
    setView('board');
    setCurrentTask(null);
    if (userEmail) {
        persistState(userEmail, {
            lastActiveView: 'board',
            lastActiveTaskId: undefined
        });
    }
  }

  const handleCompleteTask = () => {
    if (currentTask && !currentTask.isCompleted) {
      const now = Date.now();
      const completedTask = { ...currentTask, isCompleted: true, completedAt: now };
      const updatedTasks = tasks.map(t => t.id === currentTask.id ? completedTask : t);
      
      setCurrentTask(completedTask);
      updateTasksAndPersist(updatedTasks);
    }
  };

  const handleQuizAnswer = (questionId: string, answer: string) => {
      if (!currentTask) return;

      const updatedTask = {
          ...currentTask,
          userAnswers: {
              ...(currentTask.userAnswers || {}),
              [questionId]: answer
          }
      };
      
      const updatedTasks = tasks.map(t => t.id === currentTask.id ? updatedTask : t);
      setCurrentTask(updatedTask);
      updateTasksAndPersist(updatedTasks);
  };

  const handleTaskStatusToggle = (taskId: string) => {
    const now = Date.now();
    const updatedTasks = tasks.map(t => {
        if (t.id === taskId) {
            const newStatus = !t.isCompleted;
            return {
                ...t,
                isCompleted: newStatus,
                completedAt: newStatus ? now : undefined
            };
        }
        return t;
    });
    if (currentTask && currentTask.id === taskId) {
        const t = updatedTasks.find(t => t.id === taskId);
        if (t) setCurrentTask(t);
    }
    updateTasksAndPersist(updatedTasks);
  };

  const handleDueDateChange = (taskId: string, date: string) => {
    const updatedTasks = tasks.map(t => 
        t.id === taskId ? { ...t, dueDate: new Date(date).toISOString() } : t
    );
    if (currentTask && currentTask.id === taskId) {
        const t = updatedTasks.find(t => t.id === taskId);
        if (t) setCurrentTask(t);
    }
    updateTasksAndPersist(updatedTasks);
  };

  const handleOpenProfile = () => {
      setView('profile');
      if (userEmail) {
          persistState(userEmail, { lastActiveView: 'profile' });
      }
  };

  const handleGenerateMoreTasks = async (difficulty: string) => {
      if (!activeCompany) return;
      const newTasks = await aiService.generateAdditionalTasks(activeCompany, difficulty);
      const updatedTasks = [...tasks, ...newTasks];
      updateTasksAndPersist(updatedTasks);
  };

  const handleGenerateFollowUp = async (parentTask: Task) => {
      if (!activeCompany) return;
      const newTasks = await aiService.generateFollowUpTask(activeCompany, parentTask.title);
      const updatedTasks = [...tasks, ...newTasks];
      updateTasksAndPersist(updatedTasks);
  };

  const handleGenerateSolution = async (task: Task) => {
      if (!activeCompany) return;
      const solution = await aiService.generateSolutionWriteup(activeCompany, task);
      const updatedTask = { ...task, solutionWriteup: solution };
      const updatedTasks = tasks.map(t => t.id === task.id ? updatedTask : t);
      setCurrentTask(updatedTask);
      updateTasksAndPersist(updatedTasks);
  };

  const handleOpenHelp = () => {
      setView('help');
  };

  const handleBackFromHelp = () => {
      if (userEmail && activeCompany) {
          setView('board');
      } else {
          setView('signin');
      }
  };

  // Aggregated tasks for Profile view (User Stats)
  const allTasks = useMemo(() => {
    const all = { ...workspaces };
    if (activeCompany) {
        all[activeCompany.id] = tasks; // Ensure we use the latest state for active company
    }
    return Object.values(all).flat();
  }, [workspaces, tasks, activeCompany]);

  if (view === 'help') {
      return <HelpCenter onBack={handleBackFromHelp} />;
  }

  if (view === 'signin') {
    return <SignIn onSignIn={handleSignIn} brandAssets={brandAssets} onHelpClick={handleOpenHelp} />;
  }

  if (view === 'onboarding') {
    return (
      <Onboarding 
        onCompanySelect={handleSwitchWorkspace} 
        onBack={handleSignOut}
        loading={loading} 
      />
    );
  }

  if (view === 'profile' && userEmail) {
    return (
      <Profile 
        email={userEmail}
        name={userName}
        activeCompany={activeCompany}
        tasks={allTasks} 
        brandAssets={brandAssets}
        onBack={handleBackToBoard}
        onUpdateName={handleUpdateName}
        onSwitchWorkspace={handleSwitchWorkspace}
      />
    );
  }

  if (view === 'board' && activeCompany && userEmail) {
    return (
      <Board 
        tasks={tasks} 
        activeCompany={activeCompany} 
        userEmail={userEmail}
        userName={userName}
        onTaskClick={handleTaskClick}
        onSignOut={handleSignOut}
        onProfileClick={handleOpenProfile}
        onStatusToggle={handleTaskStatusToggle}
        onDueDateChange={handleDueDateChange}
        onGenerateMore={handleGenerateMoreTasks}
        onHelpClick={handleOpenHelp}
      />
    );
  }

  if (view === 'detail' && currentTask && activeCompany) {
    return (
      <TaskDetail 
        task={currentTask} 
        activeCompany={activeCompany} 
        loadingDetails={loadingDetails}
        onBack={handleBackToBoard}
        onComplete={handleCompleteTask}
        onQuizAnswerChange={handleQuizAnswer}
        onGenerateFollowUp={handleGenerateFollowUp}
        onGenerateSolution={handleGenerateSolution}
      />
    );
  }

  return null;
};

export default App;