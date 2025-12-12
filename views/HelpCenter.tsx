import React from 'react';
import { ArrowLeft, Bug, Lightbulb, ExternalLink, MessageSquare, HelpCircle } from 'lucide-react';

interface HelpCenterProps {
  onBack: () => void;
}

const HelpCenter: React.FC<HelpCenterProps> = ({ onBack }) => {
  // Updated Google Form URL
  const GOOGLE_FORM_URL = "https://forms.gle/T56oAquhfPTPUUgw5";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors font-medium text-sm"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <span className="font-bold text-slate-900 flex items-center gap-2">
            <HelpCircle size={20} className="text-indigo-600"/>
            Help Center
          </span>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 animate-fade-in">
        <div className="text-center mb-12">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-4 border border-indigo-100">
              Support
           </div>
           <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">How can we help you?</h1>
           <p className="text-slate-600 text-lg max-w-lg mx-auto">
             Whether you've found a bug or have a great idea for a new feature, we're listening.
           </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
            <a 
              href={GOOGLE_FORM_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1 transition-all group relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Bug size={64} />
               </div>
               <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-6">
                  <Bug size={24} />
               </div>
               <h3 className="font-bold text-xl text-slate-900 mb-2 flex items-center gap-2">
                 Report an Issue 
                 <ExternalLink size={16} className="text-slate-400" />
               </h3>
               <p className="text-slate-500 text-sm leading-relaxed">
                 Encountered a glitch in the simulation? Let us know so we can fix it.
               </p>
            </a>

            <a 
              href={GOOGLE_FORM_URL} 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-300 hover:-translate-y-1 transition-all group relative overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Lightbulb size={64} />
               </div>
               <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                  <Lightbulb size={24} />
               </div>
               <h3 className="font-bold text-xl text-slate-900 mb-2 flex items-center gap-2">
                 Make a Suggestion
                 <ExternalLink size={16} className="text-slate-400" />
               </h3>
               <p className="text-slate-500 text-sm leading-relaxed">
                 Have an idea for a new company or project type? We'd love to hear it.
               </p>
            </a>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-8 py-4 border-b border-slate-200">
               <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare size={18} className="text-indigo-600" />
                  Frequently Asked Questions
               </h3>
            </div>
            <div className="divide-y divide-slate-100">
               <div className="p-8">
                  <h4 className="font-bold text-slate-900 mb-2">Is the data real?</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">The scenarios and data are AI-generated based on real-world patterns to simulate an authentic environment, but they are not proprietary data from the actual companies.</p>
               </div>
               <div className="p-8">
                  <h4 className="font-bold text-slate-900 mb-2">Can I save my progress?</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">Yes, your progress, completed tickets, and badges are automatically saved to your browser's local storage. You can close the tab and come back later.</p>
               </div>
               <div className="p-8">
                  <h4 className="font-bold text-slate-900 mb-2">How do I reset my progress?</h4>
                  <p className="text-sm text-slate-600 leading-relaxed">Currently, you can clear your browser's local storage for this site to completely reset your simulation state.</p>
               </div>
            </div>
        </div>
      </main>
    </div>
  );
};

export default HelpCenter;