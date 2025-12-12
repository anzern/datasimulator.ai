import React, { useState } from 'react';
import { 
  ArrowRight, Cpu, Activity, Briefcase, Heart, Target, AlertCircle, Loader2, CheckCircle,
  Layers, AlertTriangle, Lightbulb, Youtube
} from 'lucide-react';
import { BrandAssets } from '../types';
import { persistenceService } from '../services/persistence';

interface SignInProps {
  brandAssets?: BrandAssets;
  onHelpClick: () => void;
}

const SignIn: React.FC<SignInProps> = ({ brandAssets, onHelpClick }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!email.includes('@')) throw new Error("Please enter a valid email address");
      // Simulate login
      await persistenceService.signIn(email, 'placeholder-password');
      // Auth listener in App.tsx handles redirect
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Failed to start session");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-800">
      
      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <span className="font-bold text-2xl tracking-tight text-slate-900">DataSimulator.ai</span>
         </div>
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
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-16 md:pt-16 md:pb-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          {/* Left: Value Prop */}
          <div className="space-y-8 animate-fade-in relative z-10 order-2 lg:order-1">
             
             <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight text-slate-900">
               Advance in Data Career with <br/>
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

          {/* Right: Auth Card */}
          <div className="relative animate-fade-in order-1 lg:order-2">
             {/* Banner Background Effect */}
             {brandAssets?.bannerUrl ? (
                 <div className="absolute -inset-4 rounded-3xl opacity-30 blur-md overflow-hidden transform rotate-2">
                     <img src={brandAssets.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                 </div>
             ) : (
                 <div className="absolute inset-0 bg-indigo-200 rounded-3xl transform rotate-3 scale-95 opacity-50 blur-xl"></div>
             )}
             
             <div className="relative bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
                <div className="mb-8">
                   <h2 className="text-xl font-bold text-slate-900">Enter Simulation</h2>
                   <p className="text-slate-500 text-sm mt-1">Enter your work email to access your workspace.</p>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-sm text-red-600">
                     <AlertCircle size={16} className="shrink-0 mt-0.5" />
                     <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 uppercase tracking-wide">Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none text-slate-900 transition-all font-medium"
                      placeholder="name@company.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-200 hover:shadow-indigo-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader2 className="w-5 h-5 animate-spin"/> : (
                       <>
                          Start Working
                          <ArrowRight className="w-5 h-5" />
                       </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-slate-400">
                        By entering, you agree to the simulation terms. <br/>
                        Progress is saved automatically to this device.
                    </p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
            
            {/* New Section Heading */}
            <div className="text-center max-w-3xl mx-auto mb-20">
               <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight leading-tight">
                  Master the Chaos of <br/>
                  <span className="text-indigo-600">Real Production.</span>
               </h2>
               <p className="text-lg text-slate-600 leading-relaxed">
                  Most platforms teach you the tools. We teach you the job. Bridge the gap between theory and reality with simulations that mirror actual corporate workflows.
               </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* Item 1 */}
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all group">
                    <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                       <Youtube size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">The "Tutorial Hell" Problem</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                       Most courses teach syntax, not problem-solving. We built this platform to provide the missing piece: Context.
                    </p>
                </div>

                {/* Item 2 */}
                <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all group">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                       <Layers size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Disconnected Learning</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                       Traditional courses teach tools in isolation. Here, you integrate SQL, Python, and business logic to solve cohesive problems.
                    </p>
                </div>

                 {/* Item 3 */}
                 <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all group">
                    <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                       <AlertTriangle size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">The "Clean Data" Myth</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                       Real-world data is never clean. We provide messy, incomplete datasets that force you to perform rigorous data cleaning and validation.
                    </p>
                </div>

                 {/* Item 4 */}
                 <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:shadow-lg transition-all group">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                       <Lightbulb size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">Business Context First</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                       Knowing how to build a model is useless if you don't know why. We start every task with a stakeholder email and business KPIs.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <section className="bg-slate-900 py-24 text-white relative overflow-hidden">
         <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm">
               <Target className="w-8 h-8 text-indigo-400" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-8">Our Mission</h2>
            <p className="text-xl md:text-2xl text-slate-300 font-light leading-relaxed mb-12">
               "To democratize experience. We believe you shouldn't need a job to get the experience required to get a job."
            </p>
         </div>
      </section>

      <footer className="bg-white py-12 border-t border-slate-200 text-center">
         <p className="flex items-center justify-center gap-2 text-slate-500 text-sm font-medium">
            <Heart size={14} className="fill-slate-400" />
            Designed for the builders of tomorrow.
         </p>
         <div className="flex justify-center gap-6 mt-4">
             <p className="text-slate-400 text-xs">© 2026 DataSimulator.ai</p>
             <button onClick={onHelpClick} className="text-slate-400 text-xs hover:text-indigo-600 hover:underline transition-colors">Help Center</button>
         </div>
      </footer>
    </div>
  );
};

export default SignIn;