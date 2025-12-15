import React, { useState } from 'react';
import { X, Github, Link, Loader2 } from 'lucide-react';

interface AddRepoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, description: string, language: string) => Promise<void>;
}

const AddRepoModal: React.FC<AddRepoModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setLoading(true);
    // Simulate fetching repo details
    const name = url.split('/').pop()?.replace('.git', '') || 'unknown-repo';
    const description = "Imported repository";
    const language = "TypeScript"; // Default assumption for simulation
    
    await new Promise(r => setTimeout(r, 1000)); // Fake network delay
    await onAdd(name, description, language);
    setLoading(false);
    onClose();
    setUrl('');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h2 className="text-lg font-bold text-white">Import Repository</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Repository URL
            </label>
            <div className="relative">
               <Github className="absolute left-3 top-3 text-slate-500" size={18} />
               <input 
                 type="text" 
                 value={url}
                 onChange={(e) => setUrl(e.target.value)}
                 placeholder="https://github.com/username/repo"
                 className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-slate-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm font-mono"
                 autoFocus
               />
            </div>
          </div>
          
          <div className="bg-blue-900/10 border border-blue-900/30 rounded p-3 text-xs text-blue-300">
             The repository will be scanned for BMAD compliance upon import.
          </div>

          <div className="flex justify-end pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white text-sm font-medium mr-2"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!url || loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-colors flex items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Link size={16} />}
              Import
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRepoModal;