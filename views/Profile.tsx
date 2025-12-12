import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, User, Award, Zap, Layers, Star, 
  TrendingUp, Briefcase, Flame, Check, RefreshCw
} from 'lucide-react';
import { CompanyType, Task, BrandAssets } from '../types';
import { COMPANIES } from '../constants';

interface ProfileProps {
  email: string;
  name: string;
  activeCompany: CompanyType | null;
  tasks: Task[];
  brandAssets?: BrandAssets;
  onBack: () => void;
  onUpdateName: (name: string) => void;
  onSwitchWorkspace: (companyId: string) => void;
}

// Badge Definition
type Badge = {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  condition: (tasks: Task[]) => boolean;
};

const BADGES: Badge[] = [
  {
    id: 'first-blood',
    label: 'Onboarding Complete',
    icon: <Zap size={16} />,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    description: 'Closed your first ticket',
    condition: (t) => t.filter(x => x.isCompleted).length >= 1
  },
  {
    id: 'analyst',
    label: 'Contributor',
    icon: <TrendingUp size={16} />,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    description: 'Delivered 3 successful projects',
    condition: (t) => t.filter(x => x.isCompleted).length >= 3
  },
  {
    id: 'scientist',
    label: 'Core Member',
    icon: <Briefcase size={16} />,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    description: 'Delivered 5 successful projects',
    condition: (t) => t.filter(x => x.isCompleted).length >= 5
  },
  {
    id: 'completionist',
    label: 'Staff Engineer',
    icon: <Star size={16} />,
    color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    description: 'Cleared the entire roadmap',
    condition: (t) => t.length > 0 && t.every(x => x.isCompleted)
  }
];

const HeatmapCell = ({ count }: { count: number }) => {
  let colorClass = 'bg-slate-100';
  if (count === 1) colorClass = 'bg-emerald-200';
  if (count > 1) colorClass = 'bg-emerald-400';
  if (count > 3) colorClass = 'bg-emerald-600';

  return (
    <div 
      title={`${count} submissions`}
      className={`w-2.5 h-2.5 rounded-sm ${colorClass}`} 
    />
  );
};

const Profile: React.FC<ProfileProps> = ({ email, name, activeCompany, tasks, onBack, onUpdateName, onSwitchWorkspace }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(name || 'Anonymous Engineer');
  const [activeTab, setActiveTab] = useState('Overview');
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  const completedTasks = tasks.filter(t => t.isCompleted);
  // Sort by completedAt descending
  const recentHistory = [...completedTasks].sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));

  const totalTasks = tasks.length;
  const progress = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;
  
  // Gamification Stats
  const xp = completedTasks.length * 150;
  const rank = xp < 450 ? 'Junior' : xp < 1000 ? 'Mid-Level' : 'Senior';
  const earnedBadges = BADGES.filter(b => b.condition(tasks));
  
  // Extract unique skills from COMPLETED tasks only
  const skills = Array.from(new Set(completedTasks.flatMap(t => t.skills)));

  // Calculate Streak
  const streak = useMemo(() => {
    if (completedTasks.length === 0) return 0;
    
    // Get unique dates of completion
    const dates = new Set(
        completedTasks
        .filter(t => t.completedAt)
        .map(t => new Date(t.completedAt!).toDateString())
    );
    
    let currentStreak = 0;
    const today = new Date();
    
    // Check backwards from today
    for (let i = 0; i < 365; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        if (dates.has(d.toDateString())) {
            currentStreak++;
        } else if (i === 0 && !dates.has(d.toDateString())) {
            // If today is missing, streak might still be active from yesterday
            continue; 
        } else {
            break;
        }
    }
    return currentStreak;
  }, [completedTasks]);

  const handleSave = () => {
    onUpdateName(tempName);
    setIsEditing(false);
  };

  const handleSwitchClick = async (companyId: string) => {
      if (companyId === activeCompany?.id) return;
      setSwitchingId(companyId);
      await onSwitchWorkspace(companyId);
      setSwitchingId(null);
  }

  // Generate Real Heatmap Data (Last 120 days)
  const heatmapData = useMemo(() => {
    const data = [];
    const today = new Date();
    // Normalize today to start of day for comparison
    today.setHours(0,0,0,0);

    for (let i = 119; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toDateString();
        
        const count = completedTasks.filter(t => {
            if (!t.completedAt) return false;
            return new Date(t.completedAt).toDateString() === dateStr;
        }).length;
        
        data.push({ date: dateStr, count });
    }
    return data;
  }, [completedTasks]);

  // --- RENDER CONTENT BASED ON TAB ---

  const renderOverview = () => (
      <div className="space-y-6 animate-fade-in">
           {/* Top Stats Row */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Solved Problems Card */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="text-sm font-medium text-slate-500 mb-4">Career Trajectory</h3>
                 <div className="flex items-center gap-8">
                    {/* Circle Chart */}
                    <div className="relative w-24 h-24 shrink-0">
                       <svg className="w-full h-full transform -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                          <circle cx="48" cy="48" r="40" stroke="#4f46e5" strokeWidth="8" fill="none" 
                             strokeDasharray={`${progress * 2.51} 251`} strokeLinecap="round" />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-xl font-bold text-slate-900">{completedTasks.length}</span>
                          <span className="text-[10px] text-slate-400 uppercase">Shipped</span>
                       </div>
                    </div>
                    
                    {/* Breakdown */}
                    <div className="flex-1 space-y-3">
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600">Experience Hours</span>
                          <span className="font-bold text-slate-900">{Math.round(totalTasks * 2.5)}h</span>
                       </div>
                       <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-400" style={{ width: `${progress}%` }}></div>
                       </div>
                       <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-600">Impact Score</span>
                          <span className="font-bold text-slate-900">{xp}</span>
                       </div>
                       <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-400" style={{ width: `${(xp % 450) / 4.5}%` }}></div>
                       </div>
                    </div>
                 </div>
              </div>

              {/* Badges & Streak Card */}
              <div className="grid grid-rows-2 gap-4">
                 <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="text-sm font-medium text-slate-500">Achievements</h3>
                       <span className="text-xs font-bold text-slate-300">{earnedBadges.length} Earned</span>
                    </div>
                    <div className="flex gap-2 mt-1">
                       {earnedBadges.length > 0 ? earnedBadges.map(badge => (
                          <div key={badge.id} title={badge.description} className={`w-10 h-10 rounded-lg flex items-center justify-center border ${badge.color}`}>
                             {badge.icon}
                          </div>
                       )) : (
                          <div className="text-sm text-slate-400 italic flex items-center gap-2">
                             <Award size={16} /> No achievements yet
                          </div>
                       )}
                    </div>
                 </div>

                 <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                    <div>
                       <h3 className="text-sm font-medium text-slate-500 mb-1">Consistency Streak</h3>
                       <div className="text-2xl font-bold text-slate-900">
                          {streak} <span className="text-sm font-normal text-slate-400">days</span>
                       </div>
                    </div>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${streak > 0 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'}`}>
                       <Flame size={24} className={streak > 0 ? "fill-orange-600" : ""} />
                    </div>
                 </div>
              </div>
           </div>

           {/* Activity Graph */}
           <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-base font-bold text-slate-900">Contribution History (Last 4 Months)</h3>
                 <div className="flex gap-2">
                    <span className="text-xs text-slate-400">Less</span>
                    <div className="flex gap-1">
                       <div className="w-2.5 h-2.5 bg-slate-100 rounded-sm"></div>
                       <div className="w-2.5 h-2.5 bg-emerald-200 rounded-sm"></div>
                       <div className="w-2.5 h-2.5 bg-emerald-400 rounded-sm"></div>
                       <div className="w-2.5 h-2.5 bg-emerald-600 rounded-sm"></div>
                    </div>
                    <span className="text-xs text-slate-400">More</span>
                 </div>
              </div>
              
              {/* Heatmap Grid */}
              <div className="flex flex-wrap gap-1">
                 {heatmapData.map((day, i) => (
                    <HeatmapCell key={i} count={day.count} />
                 ))}
              </div>
              <div className="mt-4 text-xs text-slate-400 font-medium">
                 Total active days: {heatmapData.filter(d => d.count > 0).length}
              </div>
           </div>
      </div>
  );

  const renderActivity = () => (
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in">
          <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900">Project Timeline</h3>
          </div>
          <div className="p-6 relative">
              {recentHistory.length > 0 ? (
                  <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                      {recentHistory.map((task, idx) => (
                          <div key={task.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                              
                              {/* Icon */}
                              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-emerald-100 text-emerald-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 absolute left-0 md:static">
                                  <Check size={20} strokeWidth={3} />
                              </div>
                              
                              {/* Card Content */}
                              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all ml-14 md:ml-0">
                                  <div className="flex items-center justify-between mb-1">
                                      <span className="font-bold text-slate-900 text-sm truncate pr-2">{task.title}</span>
                                      <time className="font-mono text-xs text-slate-500">{task.completedAt ? new Date(task.completedAt).toLocaleDateString() : ''}</time>
                                  </div>
                                  <p className="text-slate-500 text-xs mb-2 line-clamp-2">{task.descriptionShort}</p>
                                  <div className="flex flex-wrap gap-1">
                                    {task.skills.slice(0, 3).map((s, i) => (
                                        <span key={i} className="text-[10px] font-medium px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded">
                                            {s}
                                        </span>
                                    ))}
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              ) : (
                  <div className="text-center py-12">
                      <Layers className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                      <p className="text-slate-500 font-medium">No activity recorded yet.</p>
                      <p className="text-xs text-slate-400 mt-1">Ship projects to build your timeline.</p>
                  </div>
              )}
          </div>
      </div>
  );

  const renderWorkspaces = () => (
      <div className="space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {COMPANIES.map(company => {
                  const isActive = activeCompany?.id === company.id;
                  
                  return (
                    <button 
                        key={company.id}
                        onClick={() => handleSwitchClick(company.id)}
                        disabled={switchingId === company.id}
                        className={`flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${isActive ? 'bg-indigo-50 border-indigo-200 ring-1 ring-indigo-200' : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'}`}
                    >
                        <div className={`p-3 rounded-lg shrink-0 ${isActive ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 text-slate-500'}`}>
                            {company.icon}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                                <h4 className={`font-bold ${isActive ? 'text-indigo-900' : 'text-slate-900'}`}>{company.label}</h4>
                                {isActive && <span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">Active</span>}
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2">{company.description}</p>
                            {switchingId === company.id && (
                                <div className="mt-3 text-xs text-indigo-600 font-medium flex items-center gap-1">
                                    <RefreshCw size={12} className="animate-spin"/> Switching...
                                </div>
                            )}
                        </div>
                    </button>
                  );
              })}
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
        {/* Header Section */}
        <div className="bg-white border-b border-slate-200">
            <div className="max-w-5xl mx-auto px-6 py-6">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-6 text-sm font-medium">
                    <ArrowLeft size={18} /> Back to Board
                </button>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Avatar */}
                    <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center text-3xl font-bold shadow-xl border-4 border-white shrink-0">
                        {name ? name[0].toUpperCase() : email[0].toUpperCase()}
                    </div>

                    <div className="flex-1 w-full">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                                {isEditing ? (
                                    <div className="flex items-center gap-2">
                                        <input 
                                            value={tempName}
                                            onChange={(e) => setTempName(e.target.value)}
                                            className="text-2xl font-bold text-slate-900 border-b-2 border-indigo-500 outline-none bg-transparent"
                                            autoFocus
                                        />
                                        <button onClick={handleSave} className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-lg font-bold">Save</button>
                                    </div>
                                ) : (
                                    <h1 
                                        onClick={() => setIsEditing(true)}
                                        className="text-3xl font-bold text-slate-900 cursor-pointer hover:text-indigo-600 transition-colors flex items-center gap-2 group"
                                    >
                                        {name || 'Anonymous Engineer'}
                                        <span className="opacity-0 group-hover:opacity-100 text-slate-400 text-sm font-normal">(Edit)</span>
                                    </h1>
                                )}
                                <p className="text-slate-500 flex items-center gap-2 mt-1">
                                    <User size={14} /> {email} 
                                    <span className="text-slate-300">|</span> 
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                                        rank === 'Senior' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                        rank === 'Mid-Level' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                        'bg-slate-100 text-slate-600 border-slate-200'
                                    }`}>
                                        {rank}
                                    </span>
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <div className="text-xs text-slate-400 uppercase font-bold">Current Role</div>
                                    <div className="font-bold text-slate-900">{activeCompany?.label || 'Unassigned'}</div>
                                </div>
                                <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100 text-indigo-600">
                                    {activeCompany?.icon || <Briefcase size={20}/>}
                                </div>
                            </div>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mt-4">
                            {skills.length > 0 ? skills.slice(0, 8).map(skill => (
                                <span key={skill} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded border border-slate-200">
                                    {skill}
                                </span>
                            )) : (
                                <span className="text-slate-400 text-sm italic">Complete tasks to earn skill badges...</span>
                            )}
                            {skills.length > 8 && <span className="text-xs text-slate-400 self-center">+{skills.length - 8} more</span>}
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-6 mt-10 border-b border-slate-100">
                    {['Overview', 'Activity', 'Workspaces'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${
                                activeTab === tab 
                                ? 'text-indigo-600 border-indigo-600' 
                                : 'text-slate-500 border-transparent hover:text-slate-800'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Content Area */}
        <div className="max-w-5xl mx-auto px-6 py-8">
            {activeTab === 'Overview' && renderOverview()}
            {activeTab === 'Activity' && renderActivity()}
            {activeTab === 'Workspaces' && renderWorkspaces()}
        </div>
    </div>
  );
};

export default Profile;