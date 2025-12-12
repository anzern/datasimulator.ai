import React, { useState } from 'react';
import { LogOut, LayoutGrid, CheckSquare, Search, Filter, Plus, Loader2, HelpCircle } from 'lucide-react';
import { CompanyType, Task } from '../types';
import TaskCard from '../components/TaskCard';

interface BoardProps {
  tasks: Task[];
  activeCompany: CompanyType;
  userEmail: string;
  userName?: string;
  onTaskClick: (task: Task) => void;
  onSignOut: () => void;
  onProfileClick: () => void;
  onStatusToggle: (taskId: string) => void;
  onDueDateChange: (taskId: string, date: string) => void;
  onGenerateMore: (difficulty: string) => Promise<void>;
  onHelpClick: () => void;
}

const Board: React.FC<BoardProps> = ({ 
    tasks, activeCompany, userEmail, userName, 
    onTaskClick, onSignOut, onProfileClick,
    onStatusToggle, onDueDateChange, onGenerateMore, onHelpClick
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenDropdown, setShowGenDropdown] = useState(false);
  
  const completedCount = tasks.filter(t => t.isCompleted).length;
  const progress = Math.round((completedCount / tasks.length) * 100);

  const handleGenerateClick = async (difficulty: string) => {
      setShowGenDropdown(false);
      setIsGenerating(true);
      await onGenerateMore(difficulty);
      setIsGenerating(false);
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-50 overflow-hidden font-sans">
      
      {/* HEADER */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm z-20 shrink-0">
        
        {/* Left: Brand / Company */}
        <div className="flex items-center gap-4">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-100 shadow-sm">
            {activeCompany.icon}
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base leading-tight">{activeCompany.label}</h2>
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1">
               <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
               Active Sprint
            </div>
          </div>
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-4 md:gap-6">
           {/* Progress Widget */}
           <div className="hidden md:flex flex-col items-end">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Sprint Completion</div>
              <div className="flex items-center gap-2">
                 <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 transition-all duration-500 shadow-[0_0_10px_rgba(79,70,229,0.5)]" style={{ width: `${progress}%` }}></div>
                 </div>
                 <span className="text-xs font-bold text-slate-700">{progress}%</span>
              </div>
           </div>

           <div className="h-8 w-px bg-slate-200 hidden md:block"></div>

           {/* User Profile */}
           <button 
              onClick={onProfileClick}
              className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all group"
           >
               <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                     {userName || 'User'}
                  </div>
                  <div className="text-[10px] text-slate-400">View Career Profile</div>
               </div>
               <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white shadow-md">
                  {userName ? userName[0].toUpperCase() : userEmail[0].toUpperCase()}
               </div>
           </button>

           <div className="flex items-center border-l border-slate-200 pl-4 gap-2">
               <button 
                 onClick={onHelpClick}
                 className="text-slate-400 hover:text-indigo-600 transition-colors p-2 hover:bg-indigo-50 rounded-lg"
                 title="Help Center"
               >
                  <HelpCircle size={18} />
               </button>
               <button 
                 onClick={onSignOut} 
                 className="text-slate-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 rounded-lg"
                 title="Sign Out"
               >
                  <LogOut size={18} />
               </button>
           </div>
        </div>
      </header>

      {/* MAIN BOARD */}
      <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 md:p-6 scrollbar-thin">
        <div className="max-w-7xl mx-auto pb-10">
           
           {/* Toolbar */}
           <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-sm text-slate-600">
                    <LayoutGrid size={16} className="text-indigo-500"/>
                    <span className="font-semibold">{tasks.length} Active Tickets</span>
                 </div>
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm text-sm text-slate-600">
                    <CheckSquare size={16} className="text-emerald-500"/>
                    <span className="font-semibold">{completedCount} Closed</span>
                 </div>
              </div>

              <div className="flex items-center gap-2">
                 <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input 
                       type="text" 
                       placeholder="Filter tickets..." 
                       className="pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-48 md:w-64"
                    />
                 </div>
                 <div className="relative">
                    <button 
                        onClick={() => setShowGenDropdown(!showGenDropdown)}
                        disabled={isGenerating}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-70"
                    >
                        {isGenerating ? <Loader2 size={16} className="animate-spin"/> : <Plus size={16} />}
                        Create Ticket
                    </button>
                    {showGenDropdown && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-30 overflow-hidden animate-fade-in">
                            <div className="p-2 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">Select Complexity</div>
                            <button onClick={() => handleGenerateClick('Easy')} className="w-full text-left px-4 py-2 text-sm hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 font-medium">Junior (Analysis)</button>
                            <button onClick={() => handleGenerateClick('Medium')} className="w-full text-left px-4 py-2 text-sm hover:bg-amber-50 text-slate-700 hover:text-amber-700 font-medium">Mid (Modeling)</button>
                            <button onClick={() => handleGenerateClick('Hard')} className="w-full text-left px-4 py-2 text-sm hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-medium">Senior (MLOps)</button>
                        </div>
                    )}
                 </div>
              </div>
           </div>

           {/* Grid Layout */}
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tasks.map((task) => (
                 <TaskCard 
                    key={task.id} 
                    task={task} 
                    onClick={() => onTaskClick(task)}
                    onStatusToggle={() => onStatusToggle(task.id)}
                    onDateChange={(date) => onDueDateChange(task.id, date)}
                 />
              ))}
              
              {/* Skeleton Card (Loading State) */}
              {isGenerating && (
                  <div className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm p-4 animate-pulse h-64">
                      <div className="flex justify-between mb-4">
                          <div className="w-8 h-4 bg-slate-200 rounded"></div>
                          <div className="w-16 h-4 bg-slate-200 rounded"></div>
                      </div>
                      <div className="space-y-2 flex-1">
                          <div className="w-3/4 h-6 bg-slate-200 rounded"></div>
                          <div className="w-1/2 h-6 bg-slate-200 rounded"></div>
                          <div className="w-full h-20 bg-slate-100 rounded mt-4"></div>
                      </div>
                  </div>
              )}
           </div>

        </div>
      </div>
    </div>
  );
};

export default Board;