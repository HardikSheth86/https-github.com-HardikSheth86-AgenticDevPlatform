import React from 'react';
import { X, Github, Check, RefreshCw, Link } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-2xl shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">System Settings</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Integrations Section */}
          <section>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Integrations</h3>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-white">
                  <Github size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-200">GitHub</h4>
                  <p className="text-xs text-slate-500">Connected as @AgenticDevBot</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-500 bg-green-900/20 px-3 py-1.5 rounded-full border border-green-900/50">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-medium">Synced</span>
              </div>
            </div>
          </section>

          {/* Connected Repositories */}
          <section>
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Linked Applications</h3>
            <div className="space-y-3">
              <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex items-center justify-between group hover:border-blue-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-900/20 rounded text-blue-400">
                     <Link size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200">HardikSheth86 / Sapphire</h4>
                    <p className="text-xs text-slate-500">Last synced: Just now</p>
                  </div>
                </div>
                <button className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors">
                  <RefreshCw size={12} /> Sync Config
                </button>
              </div>
              
               <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex items-center justify-between opacity-50">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-slate-800 rounded text-slate-500">
                     <Link size={18} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200">Connect new repository...</h4>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
           <div className="bg-blue-900/20 border border-blue-900/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                 <Check size={18} className="text-blue-400 mt-0.5" />
                 <div>
                    <h4 className="text-sm font-bold text-blue-200">Sapphire Integration Active</h4>
                    <p className="text-xs text-blue-300/70 mt-1">
                       The OS has full read/write access to the Sapphire codebase. You can now generate stories, plan features, and deploy updates directly to this repository.
                    </p>
                 </div>
              </div>
           </div>
        </div>

        <div className="p-6 border-t border-slate-800 flex justify-end">
          <button onClick={onClose} className="px-6 py-2 bg-white text-slate-900 font-bold rounded-lg hover:bg-slate-200 transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;