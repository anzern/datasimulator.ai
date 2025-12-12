import React, { useState } from 'react';
import { Cpu, ChevronDown, RefreshCw, ChevronRight, ArrowLeft, Database, Layers, Terminal } from 'lucide-react';
import { COMPANIES } from '../constants';

interface OnboardingProps {
  onCompanySelect: (id: string) => void;
  onBack: () => void;
  loading: boolean;
}

const Onboarding: React.FC<OnboardingProps> = ({ onCompanySelect, onBack, loading }) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("");
  const selectedCompanyData = COMPANIES.find(c => c.id === selectedCompanyId);

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden flex items-center">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-100 rounded-full blur-[100px] opacity-60 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col md:flex-row items-center gap-12 lg:gap-24 relative z-10 w-full">
            {/* Left Content */}
            <div className="flex-1 space-y-8 animate-fade-in">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors mb-4 group"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform"/>
                    <span className="font-medium">Back to Home</span>
                </button>

                <div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
                        Select Your <br/>
                        <span className="text-indigo-600">Industry Simulation</span>
                    </h1>
                    <p className="text-lg text-slate-600 leading-relaxed max-w-xl">
                        Simulate the tenure of a Data Scientist at a top-tier tech company. You will face the exact messy, undefined problems their real data teams tackle daily.
                    </p>
                </div>

                <div className="space-y-6 pt-4">
                    <div className="flex gap-4 items-start">
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 text-indigo-600 shrink-0">
                             <Database size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">End-to-End Engineering</h3>
                            <p className="text-slate-600 text-sm mt-1 leading-relaxed">Don't just analyze CSVs. Build pipelines, architect databases, and deploy Docker containers.</p>
                        </div>
                    </div>
                     <div className="flex gap-4 items-start">
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 text-indigo-600 shrink-0">
                             <Layers size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">Production-Grade Chaos</h3>
                            <p className="text-slate-600 text-sm mt-1 leading-relaxed">Wrangle nulls, resolve schema conflicts, and handle legacy data. Real systems are never clean.</p>
                        </div>
                    </div>
                     <div className="flex gap-4 items-start">
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 text-indigo-600 shrink-0">
                             <Terminal size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 text-lg">Staff-Level Decision Making</h3>
                            <p className="text-slate-600 text-sm mt-1 leading-relaxed">Navigate stakeholder ambiguity, make architectural trade-offs, and prioritize business value.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Form Card */}
            <div className="flex-1 w-full max-w-md">
                 <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 animate-fade-in delay-100">
                    <div className="bg-slate-900 p-6 text-white">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                           <Cpu className="text-indigo-400" />
                           Initialize Workspace
                        </h2>
                        <p className="text-slate-400 text-sm mt-1">Select your target environment</p>
                    </div>
                    
                    <div className="p-6 md:p-8 space-y-6">
                         <div className="space-y-2">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Organization</label>
                            <div className="relative">
                            <select 
                                className="w-full p-4 pl-4 pr-10 bg-slate-50 border border-slate-200 rounded-xl appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500 outline-none text-slate-700 font-medium transition-shadow"
                                onChange={(e) => setSelectedCompanyId(e.target.value)}
                                value={selectedCompanyId}
                            >
                                <option value="" disabled>Select organization...</option>
                                {COMPANIES.map(c => (
                                <option key={c.id} value={c.id}>{c.label}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none w-5 h-5" />
                            </div>
                        </div>

                        {selectedCompanyData ? (
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-fade-in">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                                {selectedCompanyData.icon}
                                </div>
                                <div>
                                <h3 className="font-semibold text-slate-900">{selectedCompanyData.label}</h3>
                                <p className="text-xs text-slate-500">{selectedCompanyData.industry}</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {selectedCompanyData.description}
                            </p>
                            </div>
                        ) : (
                            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 border-dashed flex flex-col items-center justify-center text-center">
                                <span className="text-2xl mb-2">🏢</span>
                                <p className="text-sm text-slate-500">Select an organization to preview the simulation parameters.</p>
                            </div>
                        )}

                         <button
                            onClick={() => onCompanySelect(selectedCompanyId)}
                            disabled={!selectedCompanyId || loading}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                            <>
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Provisioning Environment...
                            </>
                            ) : (
                            <>
                                Begin Simulation
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </>
                            )}
                        </button>
                    </div>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default Onboarding;