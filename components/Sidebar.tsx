import React from 'react';
import { GitBranch, GitPullRequest, Layout, Box, Settings, Star, Github, Sparkles, FolderPlus, Command, Plus } from 'lucide-react';
import { Repository } from '../types';

interface SidebarProps {
  repos: Repository[];
  selectedRepoId: string | null;
  onSelectRepo: (id: string | null) => void;
  onSettingsClick: () => void;
  currentView: 'workspace' | 'chat';
  onViewChange: (view: 'workspace' | 'chat') => void;
  onAddRepoClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ repos, selectedRepoId, onSelectRepo, onSettingsClick, currentView, onViewChange, onAddRepoClick }) => {
  return (
    <div className="w-64 bg-[#0d1117] border-r border-slate-800 flex flex-col h-screen font-sans">
      {/* Logo Area */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-800 bg-[#161b22]">
        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#0d1117] shadow-lg shadow-purple-900/20">
          <Github size={20} fill="#0d1117" />
        </div>
        <div className="flex flex-col">
            <span className="font-bold text-white tracking-tight leading-none text-sm">GitHub Copilot</span>
            <span className="text-[10px] text-slate-400 font-mono">BMAD Studio</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="p-3 space-y-1">
        <button 
          onClick={() => onViewChange('workspace')}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            currentView === 'workspace' 
              ? 'bg-blue-900/20 text-blue-400 border border-blue-900/50' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
          }`}
        >
          <Layout size={16} />
          Workspace
        </button>
        <button 
          onClick={() => onViewChange('chat')}
          className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            currentView === 'chat' 
              ? 'bg-blue-900/20 text-blue-400 border border-blue-900/50' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
          }`}
        >
          <Command size={16} />
          Copilot Chat
        </button>
      </div>

      {/* Repositories Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          Repositories
        </h3>
        <button 
           onClick={onAddRepoClick}
           className="text-slate-500 hover:text-white p-1 hover:bg-slate-800 rounded transition-colors" 
           title="Import Repository"
        >
           <Plus size={14} />
        </button>
      </div>

      {/* Repo List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        {/* Add Existing Repo Button */}
        <button
          onClick={onAddRepoClick}
          className="w-full text-left p-3 rounded-lg border mb-3 flex items-center gap-3 transition-all group bg-[#161b22] border-slate-800 text-slate-400 hover:border-slate-600 hover:text-slate-200"
        >
          <div className="p-1.5 rounded-md bg-slate-800 group-hover:bg-slate-700">
             <FolderPlus size={16} />
          </div>
          <span className="font-semibold text-sm">Add Existing Repo</span>
        </button>

        {repos.map((repo) => (
          <button
            key={repo.id}
            onClick={() => {
              onSelectRepo(repo.id);
              onViewChange('workspace');
            }}
            className={`w-full text-left p-2.5 rounded-md border transition-all group ${
              selectedRepoId === repo.id && currentView === 'workspace'
                ? 'bg-[#161b22] border-slate-600'
                : 'bg-transparent border-transparent hover:bg-slate-800/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`font-medium text-sm truncate max-w-[120px] ${selectedRepoId === repo.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>
                {repo.name}
              </span>
              {repo.source === 'google-studio' ? (
                <span className="text-[10px] text-purple-400"><Sparkles size={10} /></span>
              ) : (
                <span className="text-[10px] text-slate-500"><Github size={10} /></span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <GitBranch size={10} />
                {repo.branch}
              </div>
              <div className="flex items-center gap-1">
                <Star size={10} />
                {repo.stars}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-800 bg-[#161b22]">
         <div className="flex items-center gap-3 mb-4">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 p-0.5">
                <div className="w-full h-full rounded-full bg-[#0d1117] flex items-center justify-center">
                   <Sparkles size={14} className="text-white" />
                </div>
             </div>
             <div>
                <div className="text-xs font-bold text-white">Copilot Enterprise</div>
                <div className="text-[10px] text-slate-400">BMAD Framework Active</div>
             </div>
         </div>
         <button 
          onClick={onSettingsClick}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
         >
          <Settings size={16} />
          Settings
        </button>
      </div>
    </div>
  );
};

export default Sidebar;