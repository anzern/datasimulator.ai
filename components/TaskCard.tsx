import React from 'react';
import { CheckCircle, Calendar, Clock, AlertCircle } from 'lucide-react';
import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  onStatusToggle: () => void;
  onDateChange: (date: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onStatusToggle, onDateChange }) => {
  
  const handleDateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleStatusClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStatusToggle();
  };

  const isOverdue = new Date(task.dueDate) < new Date() && !task.isCompleted;

  const difficultyColors = {
      Easy: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      Medium: 'bg-amber-100 text-amber-700 border-amber-200',
      Hard: 'bg-rose-100 text-rose-700 border-rose-200'
  };

  return (
    <div 
      className={`group relative flex flex-col bg-white rounded-xl border transition-all duration-200 shadow-sm overflow-hidden
        ${task.isCompleted 
            ? 'border-emerald-100 bg-emerald-50/30 opacity-75' 
            : 'border-slate-200 hover:border-indigo-400 hover:shadow-md cursor-pointer'
        }`}
      onClick={onClick}
    >
      {/* Optional Thumbnail */}
      {task.thumbnailUrl && (
          <div className="h-24 w-full bg-slate-100 overflow-hidden relative border-b border-slate-100">
              <img src={task.thumbnailUrl} alt="" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              {task.isCompleted && <div className="absolute inset-0 bg-emerald-500/20 mix-blend-multiply"></div>}
          </div>
      )}

      {/* Top Bar: Status & Difficulty */}
      <div className="flex justify-between items-start p-4 pb-2">
         {/* Status Toggle */}
         <button 
            onClick={handleStatusClick}
            className={`flex items-center gap-2 px-2 py-1 rounded-md transition-colors border ${
                task.isCompleted 
                ? 'bg-emerald-100 border-emerald-200 text-emerald-700' 
                : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600'
            }`}
         >
            {task.isCompleted ? (
                <CheckCircle size={16} className="text-emerald-600" />
            ) : (
                <div className="w-4 h-4 rounded-full border-2 border-slate-300 group-hover:border-indigo-500"></div>
            )}
            <span className="text-[10px] font-bold uppercase tracking-wide">
                {task.isCompleted ? 'Done' : 'ToDo'}
            </span>
         </button>

         <div className="flex items-center gap-2">
             {/* Difficulty Badge */}
             <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${difficultyColors[task.difficulty || 'Medium']}`}>
                 {task.difficulty || 'Medium'}
             </div>

            {/* Due Date Editor */}
            <div 
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md border text-[10px] font-medium transition-colors
                    ${isOverdue 
                        ? 'bg-red-50 border-red-100 text-red-600' 
                        : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-indigo-200 hover:text-indigo-600'
                    }`} 
                onClick={handleDateClick}
            >
                {isOverdue ? <AlertCircle size={12} /> : <Calendar size={12} />}
                <input 
                    type="date" 
                    value={task.dueDate.split('T')[0]}
                    onChange={(e) => onDateChange(e.target.value)}
                    className="bg-transparent outline-none w-16 cursor-pointer font-semibold"
                />
            </div>
         </div>
      </div>

      {/* Main Content */}
      <div className="p-4 pt-1 flex-1 flex flex-col">
         <div className="mb-2">
             <div className="flex gap-1 flex-wrap mb-2">
                {task.skills.slice(0, 3).map((s, i) => (
                   <span key={i} className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-tight">
                      {s}
                   </span>
                ))}
                {task.skills.length > 3 && (
                    <span className="text-[9px] font-bold text-slate-400 px-1 py-0.5">+</span>
                )}
             </div>
             
             <h4 className={`text-sm font-bold leading-tight ${task.isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                {task.title}
             </h4>
         </div>
         
         <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed mt-auto">
            {task.descriptionShort}
         </p>
      </div>

      {/* Footer Decoration */}
      <div className={`h-1 w-full rounded-b-xl ${task.isCompleted ? 'bg-emerald-400' : 'bg-indigo-500 group-hover:bg-indigo-600'}`}></div>
    </div>
  );
};

export default TaskCard;