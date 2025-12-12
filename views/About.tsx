import React from 'react';
import { ArrowLeft, Target, Youtube, Layers, Heart, Lightbulb } from 'lucide-react';

interface AboutProps {
  onBack: () => void;
}

const About: React.FC<AboutProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 overflow-y-auto">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium text-sm"
          >
            <ArrowLeft size={18} />
            Back to Login
          </button>
          <span className="font-bold text-slate-900">DataSimulator.ai</span>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 md:py-20">
        
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6 border border-indigo-100">
            Our Vision
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
            Bridging the gap between <br/>
            <span className="text-indigo-600">Theory</span> and <span className="text-indigo-600">Production</span>.
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            We built the platform we wish we had when we entered the industry. No more isolated tutorials. No more "clean" datasets. Just the reality of the job.
          </p>
        </div>

        {/* The Problem Grid */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24 animate-fade-in">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
               <Youtube size={120} />
            </div>
            <div className="relative z-10">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-6">
                    <Youtube size={24} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">The "Tutorial Trap"</h3>
                <p className="text-slate-600 leading-relaxed mb-4">
                  Learning Data Science today is fragmented. You watch a 4-hour course on deep learning, copy the code, and feel productive.
                </p>
                <p className="text-slate-600 leading-relaxed">
                  But when you open a blank IDE to solve a business problem, you're stuck. Tutorials don't teach you how to handle ambiguity, dirty data, or stakeholder requirements.
                </p>
            </div>
          </div>

          <div className="space-y-8">
             <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                   <Layers size={24} />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-slate-900 mb-2">The Integration Gap</h3>
                   <p className="text-slate-600">
                      In the real world, you don't just write a model in a notebook. You connect SQL databases, build pipelines, and deploy APIs. We force you to see the whole system.
                   </p>
                </div>
             </div>
             <div className="flex gap-4">
                <div className="w-12 h-12 shrink-0 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                   <Lightbulb size={24} />
                </div>
                <div>
                   <h3 className="text-xl font-bold text-slate-900 mb-2">Missing Context</h3>
                   <p className="text-slate-600">
                      Technical skills are commodity. The ability to translate a vague request ("Revenue is down") into a technical solution is what gets you hired.
                   </p>
                </div>
             </div>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="bg-slate-900 text-white rounded-3xl p-10 md:p-16 relative overflow-hidden mb-20">
           {/* Background Decoration */}
           <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
           
           <div className="relative z-10 text-center max-w-3xl mx-auto">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-8 border border-white/20">
                 <Target className="w-8 h-8 text-indigo-300" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-xl md:text-2xl text-slate-300 leading-relaxed font-light mb-10">
                 "To democratize experience. We believe you shouldn't need a job to get the experience required to get a job."
              </p>
              
              <div className="grid md:grid-cols-3 gap-8 text-left">
                 <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                    <h4 className="font-bold text-indigo-300 mb-2">Simulated Reality</h4>
                    <p className="text-sm text-slate-400">Replicating the chaos of real work—emails, dirty data, and ambiguous requirements.</p>
                 </div>
                 <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                    <h4 className="font-bold text-indigo-300 mb-2">Full Stack Focus</h4>
                    <p className="text-sm text-slate-400">Touching the infrastructure (Docker, SQL, Cloud) not just the Jupyter notebook.</p>
                 </div>
                 <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                    <h4 className="font-bold text-indigo-300 mb-2">Career Ready</h4>
                    <p className="text-sm text-slate-400">Every ticket you solve here is a story you can tell in your next interview.</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Footer */}
        <div className="text-center border-t border-slate-200 pt-10">
           <p className="text-slate-500 mb-6">Ready to start your tenure?</p>
           <button 
             onClick={onBack}
             className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 hover:-translate-y-1 transition-all"
           >
              Enter Simulation
           </button>
           <div className="flex justify-center gap-2 mt-8 text-slate-400">
              <Heart size={16} className="fill-slate-400" />
              <span className="text-sm">Designed for engineers.</span>
           </div>
        </div>

      </main>
    </div>
  );
};

export default About;