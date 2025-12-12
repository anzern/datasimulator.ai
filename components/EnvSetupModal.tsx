import React, { useState, useEffect } from 'react';
import { Server, RefreshCw, CheckCircle, Download } from 'lucide-react';
import { CompanyType, EnvConfig } from '../types';
import { aiService } from '../services/ai';
import { downloadFile } from '../utils';

interface EnvSetupModalProps {
  company: CompanyType;
  onClose: () => void;
}

const EnvSetupModal: React.FC<EnvSetupModalProps> = ({ company, onClose }) => {
  const [config, setConfig] = useState<EnvConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    aiService.generateEnvConfig(company).then(c => {
      setConfig(c);
      setLoading(false);
    });
  }, [company]);

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in">
        <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <Server className="w-6 h-6 text-indigo-400" />
             <div>
               <h2 className="text-xl font-bold">Infrastructure Setup</h2>
               <p className="text-sm text-slate-400">Provisioning {company.label} Local Environment</p>
             </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">Close Console</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
           {loading ? (
             <div className="flex flex-col items-center justify-center h-64 gap-4 text-slate-400">
                <RefreshCw className="w-8 h-8 animate-spin" />
                <p>Generating Infrastructure as Code (IaC)...</p>
             </div>
           ) : config && (
             <div className="space-y-8">
                {/* Step 1 */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                   <h3 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm">1</span>
                      System Prerequisites
                   </h3>
                   <div className="prose prose-sm text-slate-600">
                      <p>Verify that the following runtime dependencies are present in your development environment:</p>
                      <ul className="grid grid-cols-2 gap-2 mt-2">
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500"/> Docker Desktop (Engine v20+)</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500"/> IDE (VS Code Recommended)</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500"/> Python 3.9+ Virtual Environment</li>
                        <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500"/> SQL Client (DBeaver/pgAdmin)</li>
                      </ul>
                   </div>
                </div>

                {/* Step 2 */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                   <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm">2</span>
                        Container Orchestration
                      </h3>
                      <button 
                        onClick={() => downloadFile('docker-compose.yml', config.dockerCompose)}
                        className="text-xs flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
                      >
                         <Download size={14} /> Download Configuration
                      </button>
                   </div>
                   <p className="text-sm text-slate-600 mb-3">
                     The <code>docker-compose.yml</code> file defines the service mesh including the data warehouse (Postgres), cache layers, and workflow orchestrators.
                   </p>
                   <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto text-xs font-mono border border-slate-800">
                      {config.dockerCompose}
                   </pre>
                </div>

                {/* Step 3 */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                   <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm">3</span>
                        Database Migration
                      </h3>
                      <button 
                         onClick={() => downloadFile('init.sql', config.initSql, 'application/sql')}
                         className="text-xs flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition-colors"
                      >
                         <Download size={14} /> Download Migration
                      </button>
                   </div>
                   <p className="text-sm text-slate-600 mb-3">Execute this SQL migration script to initialize the schema structure for the {company.label} environment.</p>
                   <pre className="bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto text-xs font-mono border border-slate-800 max-h-64">
                      {config.initSql}
                   </pre>
                </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default EnvSetupModal;