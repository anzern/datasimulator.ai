import React, { useState } from 'react';
import { ArrowRight, Cpu, Briefcase, Activity, PlayCircle, Youtube, Layers, Lightbulb, Target, Heart } from 'lucide-react';
import { BrandAssets } from '../types';

interface SignInProps {
  onSignIn: (email: string) => void;
  brandAssets?: BrandAssets;
  onHelpClick: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onSignIn, brandAssets, onHelpClick }) => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onSignIn(email.trim());
    }
  };

  const handleGuestAccess = () => {
    onSignIn('guest@example.com');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-800">
      
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
         {/* Left: Brand Name */}
         <div className="flex items-center gap-2">
            <span className="font-bold text-2xl tracking-tight text-slate-900">DataSimulator.ai</span>
         </div>

         {/* Right: Uploaded/Generated Logo */}
         <div>
            {brandAssets?.logoUrl ? (
                <img 
                    src={brandAssets.logoUrl} 
                    alt="Logo" 
                    className="w-16 h-16 rounded-2xl object-contain bg-slate-900 shadow-lg border-4 border-white" 
                />
            ) : (
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Cpu className="w-6 h-6 text-white" />
                </div>
            )}
         </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-24 md:pt-16 md:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left: Value Prop */}
          <div className="space-y-8 animate-fade-in relative z-10">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold uppercase tracking-wider border border-indigo-100">
                Public Beta
             </div>
             
             <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-slate-900">
               Advance with <br/>
               <span className="text-indigo-600">Real Experience.</span>
             </h1>
             
             <p className="text-lg text-slate-600 leading-relaxed max-w-lg">
               Move beyond passive tutorials. Immerse yourself in a simulated corporate environment where you solve ambiguous business problems using production-grade tools.
             </p>

             <div className="flex flex-col sm:flex-row gap-6 text-sm font-medium text-slate-500 pt-2">
                <div className="flex items-center gap-2">
                   <div className="p-1.5 bg-indigo-100 rounded text-indigo-700"><Briefcase size={16}/></div>
                   <span>Simulate roles at Meta, Netflix, Uber</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="p-1.5 bg-purple-100 rounded text-purple-700"><Activity size={16}/></div>
                   <span>Solve real business tickets</span>
                </div>
             </div>
          </div>

          {/* Right: Login Form */}
          <div className="relative animate-fade-in">
             {/* Banner Background Effect */}
             {brandAssets?.bannerUrl ? (
                 <div className="absolute -inset-4 rounded-3xl opacity-30 blur-md overflow-hidden transform rotate-2">
                     <img src={brandAssets.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                 </div>
             ) : (
                 <div className="absolute inset-0 bg-indigo-200 rounded-3xl transform rotate-3 scale-95 opacity-50 blur-xl"></div>
             )}
             
             <div className="relative bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Workspace</h2>
                <p className="text-slate-500 mb-8">Sign in to initialize your simulated environment.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Work Email</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none text-slate-900 transition-all font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 flex items-center justify-center gap-2"
                  >
                    Enter Simulator
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>

                <div className="my-6 flex items-center gap-4">
                   <div className="h-px bg-slate-100 flex-1"></div>
                   <span className="text-xs text-slate-400 font-medium">OR</span>
                   <div className="h-px bg-slate-100 flex-1"></div>
                </div>

                <button 
                  onClick={handleGuestAccess}
                  className="w-full py-3 bg-white border border-slate-200 hover:border-indigo-300 hover:text-indigo-600 text-slate-600 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <PlayCircle className="w-4 h-4" />
                  Try Demo Account
                </button>
             </div>
          </div>
        </div>
      </div>

      {/* Why We Built This Section */}
      <section className="bg-white py-24 border-t border-slate-100">
         <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto mb-20">
               <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">The "Tutorial Hell" Problem</h2>
               <p className="text-lg text-slate-600 leading-relaxed">
                  Most courses teach syntax, not problem-solving. We built this platform to provide the missing piece: <strong>Context.</strong>
               </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
               <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-6">
                     <Youtube size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Disconnected Learning</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                     Traditional courses teach tools in isolation. Here, you integrate SQL, Python, and business logic to solve cohesive problems.
                  </p>
               </div>
               
               <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6">
                     <Lightbulb size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">The "Clean Data" Myth</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                     Real-world data is never clean. We provide messy, incomplete datasets that force you to perform rigorous data cleaning and validation.
                  </p>
               </div>

               <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                     <Layers size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Business Context First</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                     Knowing <em>how</em> to build a model is useless if you don't know <em>why</em>. We start every task with a stakeholder email and business KPIs.
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* Mission Section */}
      <section className="bg-slate-900 py-24 text-white relative overflow-hidden">
         {/* Optional Banner as Background with low opacity */}
         {brandAssets?.bannerUrl && (
             <div className="absolute inset-0 opacity-10">
                 <img src={brandAssets.bannerUrl} className="w-full h-full object-cover" />
             </div>
         )}
         <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
               <Target className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-8">Our Mission</h2>
            <p className="text-xl md:text-2xl text-slate-300 font-light leading-relaxed mb-12">
               "To democratize experience. We believe you shouldn't need a job to get the experience required to get a job."
            </p>
            <div className="flex flex-wrap justify-center gap-4">
               <span className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm text-slate-300">Simulated Reality</span>
               <span className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm text-slate-300">End-to-End Engineering</span>
               <span className="px-4 py-2 bg-white/5 rounded-full border border-white/10 text-sm text-slate-300">Industry Standard</span>
            </div>
         </div>
      </section>

      <footer className="bg-white py-12 border-t border-slate-200 text-center">
         <p className="flex items-center justify-center gap-2 text-slate-500 text-sm font-medium">
            <Heart size={14} className="fill-slate-400" />
            Designed for the builders of tomorrow.
         </p>
         <div className="flex justify-center gap-6 mt-4">
             <p className="text-slate-400 text-xs">© 2024 DataSimulator.ai</p>
             <button onClick={onHelpClick} className="text-slate-400 text-xs hover:text-indigo-600 hover:underline transition-colors">Help Center</button>
         </div>
      </footer>

    </div>
  );
};

export default SignIn;