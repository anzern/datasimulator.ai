import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, RefreshCw, Mail, Database, Terminal, FileText, Download, ImageIcon, GitBranch, Loader2, BookOpen, Lock, Unlock } from 'lucide-react';
import { Task, CompanyType } from '../types';
import MarkdownText from '../components/MarkdownText';
import { downloadFile } from '../utils';

interface TaskDetailProps {
  task: Task;
  activeCompany: CompanyType;
  loadingDetails: boolean;
  onBack: () => void;
  onComplete: () => void; 
  onQuizAnswerChange: (qId: string, val: string) => void;
  onGenerateFollowUp: (task: Task) => Promise<void>;
  onGenerateSolution: (task: Task) => Promise<void>;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ 
    task, activeCompany, loadingDetails, onBack, onComplete, onQuizAnswerChange, onGenerateFollowUp, onGenerateSolution
}) => {
  const [activeTab, setActiveTab] = useState<'email' | 'assets' | 'guide' | 'quiz' | 'solution'>('email');
  const [isGeneratingFollowUp, setIsGeneratingFollowUp] = useState(false);
  const [isGeneratingSolution, setIsGeneratingSolution] = useState(false);
  
  // We determine submission state based on whether all questions are answered
  const totalQuestions = task.quiz?.length || 0;
  const answeredCount = Object.keys(task.userAnswers || {}).length;
  // We can treat it as "Submitted" if task is completed
  const quizSubmitted = task.isCompleted;

  const handleQuizSubmit = () => {
    // In this simulation, submitting just marks it as done if all filled
    if (!task.isCompleted) {
       onComplete();
       // Auto-switch to solution tab if available, else hint at it
    }
  };

  const handleFollowUpClick = async () => {
      setIsGeneratingFollowUp(true);
      await onGenerateFollowUp(task);
      setIsGeneratingFollowUp(false);
      onBack(); // Go back to board to see new task
  };

  const handleSolutionClick = async () => {
      if (!task.isCompleted) return; // Locked
      setActiveTab('solution');
      
      if (!task.solutionWriteup && !isGeneratingSolution) {
          setIsGeneratingSolution(true);
          await onGenerateSolution(task);
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
                   {task.title}
                   {task.isCompleted && <CheckCircle className="w-5 h-5 text-emerald-500" />}
                 </h1>
                 <p className="text-xs text-slate-500 font-mono">TICKET-{task.id}</p>
              </div>
           </div>
        </div>

        <div className="flex flex-1 overflow-hidden relative">
           {loadingDetails && (
              <div className="absolute inset-0 bg-white/80 z-50 flex flex-col items-center justify-center">
                  <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                  <p className="text-slate-600 font-medium">Gathering Project Requirements...</p>
                  <p className="text-slate-400 text-sm">Compiling stakeholder briefs, raw datasets & infrastructure docs</p>
              </div>
           )}

           {/* Sidebar Navigation */}
           <div className="w-64 bg-slate-50 border-r border-slate-200 flex flex-col p-4 gap-2 shrink-0">
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
                 disabled={!task.isCompleted}
                 className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors relative group
                    ${activeTab === 'solution' 
                        ? 'bg-amber-50 shadow-sm border border-amber-200 text-amber-700' 
                        : task.isCompleted 
                            ? 'text-slate-700 hover:bg-amber-50/50 hover:text-amber-700' 
                            : 'text-slate-400 opacity-60 cursor-not-allowed hover:bg-transparent'
                    }`}
              >
                 <BookOpen size={18} />
                 <div className="flex-1">
                    <div className="font-semibold text-sm">Solution Write-Up</div>
                    {!task.isCompleted && <div className="text-[10px]">Unlock by completing task</div>}
                 </div>
                 {task.isCompleted ? <Unlock size={14} className="text-amber-500"/> : <Lock size={14}/>}
              </button>

              <div className="mt-auto pt-4 border-t border-slate-200">
                  <button 
                    onClick={handleFollowUpClick}
                    disabled={isGeneratingFollowUp}
                    className="w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-colors bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
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
              {/* Cover Image Banner (560x280 equivalent ratio 2:1 approx) */}
              {task.thumbnailUrl && (
                  <div className="w-full h-48 md:h-64 overflow-hidden relative group">
                      <img src={task.thumbnailUrl} alt="Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-6 text-white">
                          <span className="px-2 py-1 bg-white/20 backdrop-blur-md rounded text-xs font-bold uppercase tracking-widest border border-white/30">
                             {task.difficulty} Ticket
                          </span>
                      </div>
                  </div>
              )}

              <div className="p-8">
                {/* 1. Request Tab */}
                {activeTab === 'email' && task.detailsLoaded && (
                    <div className="max-w-3xl mx-auto animate-fade-in">
                        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm mb-6">
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                                    {task.senderName?.[0]}
                                </div>
                                <div>
                                    <div className="font-bold text-slate-900">{task.senderName}</div>
                                    <div className="text-xs text-slate-500">{task.senderRole}</div>
                                </div>
                            </div>
                            <div className="text-xs text-slate-400 font-medium bg-white px-2 py-1 rounded border border-slate-200">
                                High Priority
                            </div>
                        </div>
                        <div className="p-8">
                            <h2 className="text-xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">
                                {task.emailSubject}
                            </h2>
                            <div className="prose prose-slate max-w-none text-slate-700">
                                <MarkdownText text={task.emailBody || ""} />
                            </div>
                        </div>
                        </div>
                    </div>
                )}

                {/* 2. Assets Tab (Downloads) */}
                {activeTab === 'assets' && task.detailsLoaded && (
                    <div className="max-w-4xl mx-auto animate-fade-in">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Production Artifacts</h2>
                        <p className="text-slate-500 mb-8">Download these resources to your local development environment to begin the task.</p>
                        
                        <div className="grid gap-4">
                        {task.assets?.map((file, idx) => (
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
                {activeTab === 'guide' && task.detailsLoaded && (
                    <div className="max-w-3xl mx-auto animate-fade-in">
                        <h2 className="text-2xl font-bold text-slate-900 mb-6">Engineering Playbook</h2>
                        <div className="prose prose-slate max-w-none prose-pre:bg-slate-900 prose-pre:text-indigo-100">
                        <MarkdownText text={task.technicalGuide || ""} />
                        </div>
                    </div>
                )}

                {/* 4. Quiz / Validation */}
                {activeTab === 'quiz' && task.detailsLoaded && (
                    <div className="max-w-3xl mx-auto animate-fade-in">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Impact Analysis</h2>
                        <p className="text-slate-500 mb-8">Validate your findings and report the business impact of your solution.</p>

                        <div className="space-y-8">
                        {task.quiz?.map((q, idx) => {
                            const currentAnswer = task.userAnswers?.[q.id];
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
                                                        onChange={(e) => onQuizAnswerChange(q.id, e.target.value)}
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
                                        onChange={(e) => onQuizAnswerChange(q.id, e.target.value)}
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
                            {quizSubmitted ? 'Ticket Closed' : 'Submit Deliverable'}
                        </button>
                        </div>
                    </div>
                )}

                 {/* 5. Solution Write-Up Tab */}
                 {activeTab === 'solution' && task.isCompleted && (
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
                                    <MarkdownText text={task.solutionWriteup || "No solution generated yet."} />
                                </div>
                            </div>
                        )}
                    </div>
                )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;