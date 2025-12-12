import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, CheckCircle, RefreshCw, Mail, Database, Terminal, FileText, Download, ImageIcon, GitBranch, Loader2, BookOpen, Lock, Unlock, Check, Clock } from 'lucide-react';
import { Task, CompanyType } from '../types';
import MarkdownText from '../components/MarkdownText';
import { downloadFile } from '../utils';

interface TaskDetailProps {
  task: Task; // This is the ROOT task
  activeCompany: CompanyType;
  loadingDetails: boolean;
  onBack: () => void;
  onComplete: (taskId: string) => void; 
  onQuizAnswerChange: (taskId: string, qId: string, val: string) => void;
  onGenerateFollowUp: (rootTask: Task, contextTask: Task) => Promise<void>;
  onGenerateSolution: (taskId: string) => Promise<void>;
  onLoadDetails: (taskId: string) => Promise<void>;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ 
    task: rootTask, activeCompany, loadingDetails, onBack, 
    onComplete, onQuizAnswerChange, onGenerateFollowUp, onGenerateSolution, onLoadDetails
}) => {
  const [activeTab, setActiveTab] = useState<'email' | 'assets' | 'guide' | 'quiz' | 'solution'>('email');
  const [activeTaskId, setActiveTaskId] = useState<string>(rootTask.id);
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
  const [isGeneratingSolution, setIsGeneratingSolution] = useState(false);
  
  // Calculate the chain of tasks: Root -> FollowUp1 -> FollowUp2
  const taskChain = useMemo(() => {
      const chain = [rootTask];
      if (rootTask.relatedTasks) {
          chain.push(...rootTask.relatedTasks);
      }
      return chain;
  }, [rootTask]);

  // Determine the currently viewed task object
  const activeTask = taskChain.find(t => t.id === activeTaskId) || rootTask;

  // Auto-load details if selecting a task that isn't loaded yet
  useEffect(() => {
      if (activeTask && !activeTask.detailsLoaded && !loadingDetails) {
          onLoadDetails(activeTask.id);
      }
  }, [activeTask, loadingDetails]); 

  // Helper to clean HTML tags from AI response and ensure markdown compatibility
  const cleanEmailContent = (text: string) => {
      if (!text) return "";
      return text
          // Convert lists
          .replace(/<ul[^>]*>/gi, '\n')
          .replace(/<\/ul>/gi, '\n')
          .replace(/<ol[^>]*>/gi, '\n')
          .replace(/<\/ol>/gi, '\n')
          .replace(/<li[^>]*>/gi, '\n- ') // Replace <li> with newline and bullet
          .replace(/<\/li>/gi, '')
          // Convert structural tags
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<div[^>]*>/gi, '\n')
          .replace(/<\/div>/gi, '\n')
          .replace(/<p[^>]*>/gi, '\n')
          .replace(/<\/p>/gi, '\n\n') // Double newline for paragraphs
          // Convert formatting
          .replace(/<b>/gi, '**').replace(/<\/b>/gi, '**')
          .replace(/<strong>/gi, '**').replace(/<\/strong>/gi, '**')
          .replace(/<i>/gi, '_').replace(/<\/i>/gi, '_')
          .replace(/<em>/gi, '_').replace(/<\/em>/gi, '_');
  };

  // Logic for the specific active task
  const totalQuestions = activeTask.quiz?.length || 0;
  const answeredCount = Object.keys(activeTask.userAnswers || {}).length;
  const quizSubmitted = activeTask.isCompleted;

  const handleQuizSubmit = () => {
    if (!activeTask.isCompleted) {
       onComplete(activeTask.id);
    }
  };

  const handleFollowUpClick = async () => {
      setIsGeneratingFollowUp(true);
      await onGenerateFollowUp(rootTask, activeTask); // Pass Root (parent) and Active (context)
      setIsGeneratingFollowUp(false);
  };

  const handleSolutionClick = async () => {
      if (!activeTask.isCompleted) return; // Locked
      setActiveTab('solution');
      
      if (!activeTask.solutionWriteup && !isGeneratingSolution) {
          setIsGeneratingSolution(true);
          await onGenerateSolution(activeTask.id);
          setIsGeneratingSolution(false);
      }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6">
      <div className="bg-slate-100 w-full max-w-6xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in border border-slate-200">
        
        {/* Header */}
        <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
           <div className="flex items-center gap-4">
              <button 
                onClick={onBack}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                 <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                   {rootTask.title}
                   {rootTask.isCompleted && rootTask.relatedTasks?.every(t => t.isCompleted) && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                 </h1>
                 <p className="text-xs text-slate-500 font-mono">PROJECT-{rootTask.id}</p>
              </div>
           </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
           
           {/* Sidebar */}
           <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
              
              {/* Timeline Section */}
              <div className="p-4 border-b border-slate-200 bg-slate-50/50">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                      <Clock size={12}/> Project Timeline
                  </div>
                  <div className="relative pl-2 space-y-0">
                    {/* Vertical Connector Line */}
                    <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-slate-200"></div>
                    
                    {taskChain.map((t) => (
                      <div 
                        key={t.id} 
                        onClick={() => setActiveTaskId(t.id)} 
                        className="relative flex items-center gap-3 py-2 cursor-pointer group"
                      >
                         {/* Status Dot */}
                         <div className={`relative z-10 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm ${
                             t.isCompleted ? 'bg-emerald-500 border-emerald-500' :
                             activeTaskId === t.id ? 'bg-white border-indigo-600' :
                             'bg-white border-slate-300 group-hover:border-indigo-400'
                         }`}>
                            {t.isCompleted && <Check size={10} className="text-white"/>}
                            {activeTaskId === t.id && !t.isCompleted && <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"/>}
                         </div>
                         
                         <div className={`text-xs font-medium transition-colors ${activeTaskId === t.id ? 'text-indigo-700' : 'text-slate-600'}`}>
                             <span className="block truncate max-w-[140px]" title={t.title}>{t.title}</span>
                             {t.isFollowUp && <span className="text-[9px] text-slate-400 font-normal">Follow-up</span>}
                         </div>
                      </div>
                    ))}
                  </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex-1 overflow-y-auto p-4 gap-2 flex flex-col">
                  <button 
                    onClick={() => setActiveTab('email')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'email' ? 'bg-white shadow-sm border border-slate-200 text-indigo-600' : 'text-slate-600 hover:bg-white/50'}`}
                  >
                    <Mail size={18} />
                    <div className="flex-1">
                        <div className="font-semibold text-sm">Stakeholder Brief</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('assets')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'assets' ? 'bg-white shadow-sm border border-slate-200 text-indigo-600' : 'text-slate-600 hover:bg-white/50'}`}
                  >
                    <Database size={18} />
                    <div className="flex-1">
                        <div className="font-semibold text-sm">Raw Data & Assets</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('guide')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'guide' ? 'bg-white shadow-sm border border-slate-200 text-indigo-600' : 'text-slate-600 hover:bg-white/50'}`}
                  >
                    <Terminal size={18} />
                    <div className="flex-1">
                        <div className="font-semibold text-sm">Deployment Guide</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('quiz')}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'quiz' ? 'bg-white shadow-sm border border-slate-200 text-indigo-600' : 'text-slate-600 hover:bg-white/50'}`}
                  >
                    <CheckCircle size={18} />
                    <div className="flex-1">
                        <div className="font-semibold text-sm">Deliverable Review</div>
                    </div>
                  </button>

                  <div className="my-2 border-t border-slate-200"></div>

                  <button 
                    onClick={handleSolutionClick}
                    disabled={!activeTask.isCompleted}
                    className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors relative group
                        ${activeTab === 'solution' 
                            ? 'bg-amber-50 shadow-sm border border-amber-200 text-amber-700' 
                            : activeTask.isCompleted 
                                ? 'text-slate-700 hover:bg-amber-50/50 hover:text-amber-700' 
                                : 'text-slate-400 opacity-60 cursor-not-allowed hover:bg-transparent'
                        }`}
                  >
                    <BookOpen size={18} />
                    <div className="flex-1">
                        <div className="font-semibold text-sm">Solution Write-Up</div>
                        {!activeTask.isCompleted && <div className="text-[10px]">Unlock by completing task</div>}
                    </div>
                    {activeTask.isCompleted ? <Unlock size={14} className="text-amber-500"/> : <Lock size={14}/>}
                  </button>
              </div>

              {/* Generate Next Step */}
              <div className="p-4 border-t border-slate-200">
                  <button 
                    onClick={handleFollowUpClick}
                    disabled={isGeneratingFollowUp || !activeTask.isCompleted || activeTask.id !== taskChain[taskChain.length-1].id}
                    className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!activeTask.isCompleted ? "Complete current task first" : activeTask.id !== taskChain[taskChain.length-1].id ? "Select latest task to continue" : ""}
                  >
                     {isGeneratingFollowUp ? <Loader2 size={18} className="animate-spin"/> : <GitBranch size={18} />}
                     <div className="flex-1">
                        <div className="font-bold text-xs">Initialize Next Phase</div>
                        <div className="text-[10px] opacity-70">Generate Follow-up Ticket</div>
                     </div>
                  </button>
              </div>
           </div>

           {/* Main Content Area */}
           <div className="flex-1 bg-white overflow-y-auto">
              
              {!activeTask.detailsLoaded ? (
                 <div className="h-full flex flex-col items-center justify-center p-8 animate-fade-in text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
                    </div>
                    
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                        Simulating Environment...
                    </h2>
                    
                    <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
                        The AI is currently generating realistic stakeholders, dirty datasets, and infrastructure requirements for this task.
                    </p>
                 </div>
              ) : (
                <>
                  {/* Cover Image Banner */}
                  {activeTask.thumbnailUrl && (
                      <div className="w-full h-48 md:h-64 overflow-hidden relative group">
                          <img src={activeTask.thumbnailUrl} alt="Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                          <div className="absolute bottom-4 left-6 text-white">
                              <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded text-xs font-bold uppercase tracking-widest border border-white/30 mr-2">
                                {activeTask.difficulty} Ticket
                              </span>
                              {activeTask.isFollowUp && (
                                <span className="px-2 py-1 bg-indigo-500/80 backdrop-blur-md rounded text-xs font-bold uppercase tracking-widest border border-indigo-400">
                                    Phase {taskChain.findIndex(t => t.id === activeTask.id) + 1}
                                </span>
                              )}
                          </div>
                      </div>
                  )}

                  <div className="p-8">
                    {/* 1. Request Tab */}
                    {activeTab === 'email' && (
                        <div className="max-w-3xl mx-auto animate-fade-in">
                            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-6">
                                {/* Email Window Controls */}
                                <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center gap-2">
                                     <div className="flex gap-1.5">
                                         <div className="w-3 h-3 rounded-full bg-red-400/20 border border-red-400"></div>
                                         <div className="w-3 h-3 rounded-full bg-amber-400/20 border border-amber-400"></div>
                                         <div className="w-3 h-3 rounded-full bg-emerald-400/20 border border-emerald-400"></div>
                                     </div>
                                </div>

                                {/* Email Header */}
                                <div className="p-6 md:p-8 border-b border-slate-100 bg-white">
                                    <div className="flex justify-between items-start mb-6">
                                       <h2 className="text-xl md:text-2xl font-bold text-slate-900 leading-tight">
                                            {activeTask.emailSubject}
                                       </h2>
                                       <div className="shrink-0 flex gap-2">
                                           <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-medium rounded border border-slate-200">Inbox</span>
                                           <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded border border-indigo-100">Important</span>
                                       </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                                            {activeTask.senderName?.[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline justify-between">
                                                <div className="font-bold text-slate-900 truncate">
                                                    {activeTask.senderName} 
                                                    <span className="font-normal text-slate-500 text-sm ml-2">&lt;{activeTask.senderName?.toLowerCase().replace(/\s/g, '.')}@{activeCompany.id}.com&gt;</span>
                                                </div>
                                                <div className="text-xs text-slate-400 font-mono whitespace-nowrap">
                                                    {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                                                </div>
                                            </div>
                                            <div className="text-xs text-slate-500 mt-0.5">
                                                To: <span className="text-slate-700">Data Team</span> &lt;data-eng@{activeCompany.id}.com&gt;
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Email Body */}
                                <div className="p-6 md:p-8 bg-white min-h-[300px]">
                                    <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed font-sans">
                                        <MarkdownText text={cleanEmailContent(activeTask.emailBody || "")} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. Assets Tab (Downloads) */}
                    {activeTab === 'assets' && (
                        <div className="max-w-4xl mx-auto animate-fade-in">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Production Artifacts</h2>
                            <p className="text-slate-500 mb-8">Download these resources to your local development environment to begin the task.</p>
                            
                            <div className="grid gap-4">
                            {activeTask.assets?.map((file, idx) => (
                                <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-5 border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all bg-slate-50 gap-4">
                                    <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-lg border border-slate-200 shrink-0">
                                        {file.type === 'csv' && <FileText className="text-green-600"/>}
                                        {file.type === 'sql' && <Database className="text-blue-600"/>}
                                        {file.type === 'json' && <FileText className="text-yellow-600"/>}
                                        {file.type === 'image' && <ImageIcon className="text-purple-600"/>}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-700">{file.name}</h3>
                                        <p className="text-xs text-slate-500 uppercase tracking-wider">{file.type} Asset</p>
                                    </div>
                                    </div>

                                    <div className="flex items-center gap-4 self-end md:self-auto">
                                    {file.type === 'image' && file.content.startsWith('data:') && (
                                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-200 bg-white">
                                            <img src={file.content} alt={file.name} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                        <button 
                                        onClick={() => downloadFile(file.name, file.content, file.type === 'csv' ? 'text/csv' : file.type === 'image' ? 'image/png' : 'text/plain')}
                                        className="flex items-center gap-2 bg-white border border-slate-200 hover:border-indigo-500 hover:text-indigo-600 px-4 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap"
                                        >
                                        <Download size={16} />
                                        Download
                                        </button>
                                    </div>
                                </div>
                            ))}
                            </div>
                        </div>
                    )}

                    {/* 3. Technical Guide */}
                    {activeTab === 'guide' && (
                        <div className="max-w-3xl mx-auto animate-fade-in">
                            <h2 className="text-2xl font-bold text-slate-900 mb-6">Engineering Playbook</h2>
                            <div className="prose prose-slate max-w-none prose-pre:bg-slate-900 prose-pre:text-indigo-100">
                            <MarkdownText text={activeTask.technicalGuide || ""} />
                            </div>
                        </div>
                    )}

                    {/* 4. Quiz / Validation */}
                    {activeTab === 'quiz' && (
                        <div className="max-w-3xl mx-auto animate-fade-in">
                            <h2 className="text-2xl font-bold text-slate-900 mb-2">Impact Analysis</h2>
                            <p className="text-slate-500 mb-8">Validate your findings and report the business impact of your solution.</p>

                            <div className="space-y-8">
                            {activeTask.quiz?.map((q, idx) => {
                                const currentAnswer = activeTask.userAnswers?.[q.id];
                                const isCorrect = currentAnswer === q.correctAnswer;
                                
                                return (
                                    <div key={idx} className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                        <h3 className="font-semibold text-slate-800 mb-4 flex gap-2">
                                            <span className="text-indigo-600 font-bold">{idx + 1}.</span>
                                            {q.question}
                                        </h3>
                                        
                                        {q.options ? (
                                            <div className="space-y-2">
                                            {q.options.map((opt, optIdx) => {
                                                let optionClass = 'bg-white border-slate-200 hover:bg-slate-100';
                                                
                                                if (quizSubmitted) {
                                                    if (opt === q.correctAnswer) {
                                                        optionClass = 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500';
                                                    } else if (currentAnswer === opt) {
                                                        optionClass = 'bg-red-50 border-red-300';
                                                    } else {
                                                        optionClass = 'bg-white border-slate-200 opacity-50';
                                                    }
                                                } else if (currentAnswer === opt) {
                                                    optionClass = 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500';
                                                }

                                                return (
                                                    <label key={optIdx} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${optionClass}`}>
                                                        <input 
                                                            type="radio" 
                                                            name={q.id} 
                                                            value={opt}
                                                            disabled={quizSubmitted}
                                                            checked={currentAnswer === opt}
                                                            onChange={(e) => onQuizAnswerChange(activeTask.id, q.id, e.target.value)}
                                                            className="w-4 h-4 text-indigo-600"
                                                        />
                                                        <span className="text-sm text-slate-700">{opt}</span>
                                                    </label>
                                                );
                                            })}
                                            </div>
                                        ) : (
                                            <input 
                                            type="text" 
                                            placeholder="Enter your result..." 
                                            disabled={quizSubmitted}
                                            value={currentAnswer || ''}
                                            onChange={(e) => onQuizAnswerChange(activeTask.id, q.id, e.target.value)}
                                            className="w-full p-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            />
                                        )}

                                        {quizSubmitted && (
                                            <div className="mt-4 p-4 bg-white rounded-lg border border-slate-200 text-sm text-slate-600">
                                            <strong className="block mb-1 text-slate-900">Analysis:</strong>
                                            {q.explanation}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-end">
                            <button 
                                onClick={handleQuizSubmit}
                                disabled={quizSubmitted || answeredCount < totalQuestions}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:shadow-none"
                            >
                                {quizSubmitted ? 'Phase Complete' : 'Submit Deliverable'}
                            </button>
                            </div>
                        </div>
                    )}

                    {/* 5. Solution Write-Up Tab */}
                    {activeTab === 'solution' && activeTask.isCompleted && (
                        <div className="max-w-3xl mx-auto animate-fade-in">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900">Winning Solution</h2>
                                    <p className="text-amber-600 font-medium text-sm flex items-center gap-1 mt-1">
                                        <BookOpen size={14}/> 1st Place Approach (Gold Medal)
                                    </p>
                                </div>
                                <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-200">
                                    Answer Key
                                </div>
                            </div>

                            {isGeneratingSolution ? (
                                <div className="bg-white border border-slate-200 rounded-xl p-12 flex flex-col items-center justify-center text-center">
                                    <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
                                    <h3 className="text-lg font-bold text-slate-800">Drafting Solution Post...</h3>
                                    <p className="text-slate-500 text-sm mt-2 max-w-sm">Compiling feature engineering techniques, model architecture diagrams, and validation strategies.</p>
                                </div>
                            ) : (
                                <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
                                    <div className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-a:text-indigo-600 prose-strong:text-slate-900">
                                        <MarkdownText text={activeTask.solutionWriteup || "No solution generated yet."} />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                 </div>
                </>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;