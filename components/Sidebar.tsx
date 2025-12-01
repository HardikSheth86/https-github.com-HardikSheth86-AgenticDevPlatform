import React from 'react';
import { GitBranch, GitPullRequest, Layout, Box, Settings, Star, Plus, Github, Sparkles, FolderPlus } from 'lucide-react';
import { Repository } from '../types';

interface SidebarProps {
  repos: Repository[];
  selectedRepoId: string | null;
  onSelectRepo: (id: string | null) => void;
  onSettingsClick: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ repos, selectedRepoId, onSelectRepo, onSettingsClick }) => {
  return (
    <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-screen">
      {/* Logo Area */}
      <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-800">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-900/50">
          A
        </div>
        <span className="font-bold text-slate-200 tracking-tight">AgenticDev</span>
      </div>

      {/* Navigation */}
      <div className="p-3 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-900 rounded-md transition-colors">
          <Layout size={18} />
          Dashboard
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-900 rounded-md transition-colors">
          <Box size={18} />
          Packages
        </button>
      </div>

      {/* Repositories Header */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
          Projects
          <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[10px]">{repos.length}</span>
        </h3>
      </div>

      {/* Repo List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1">
        {/* New Project Button */}
        <button
          onClick={() => onSelectRepo(null)}
          className={`w-full text-left p-3 rounded-lg border mb-3 flex items-center gap-3 transition-all group ${
            selectedRepoId === null
              ? 'bg-blue-900/20 border-blue-500/50 text-blue-400 shadow-md shadow-blue-900/20'
              : 'bg-slate-900/30 border-slate-800 text-slate-400 hover:bg-slate-900 hover:border-slate-700 hover:text-slate-200'
          }`}
        >
          <div className={`p-1.5 rounded-md ${selectedRepoId === null ? 'bg-blue-500 text-white' : 'bg-slate-800 group-hover:bg-slate-700'}`}>
             <FolderPlus size={16} />
          </div>
          <span className="font-bold text-sm">Create New Project</span>
        </button>

        {repos.map((repo) => (
          <button
            key={repo.id}
            onClick={() => onSelectRepo(repo.id)}
            className={`w-full text-left p-3 rounded-lg border transition-all group ${
              selectedRepoId === repo.id
                ? 'bg-slate-900 border-blue-500/50 shadow-md shadow-blue-900/20'
                : 'bg-transparent border-transparent hover:bg-slate-900/50 hover:border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`font-medium text-sm truncate max-w-[120px] ${selectedRepoId === repo.id ? 'text-blue-400' : 'text-slate-300 group-hover:text-slate-200'}`}>
                {repo.name}
              </span>
              {repo.source === 'google-studio' ? (
                <span className="text-[10px] text-purple-300 bg-purple-900/30 border border-purple-800 px-1 rounded flex items-center gap-1">
                   <Sparkles size={8} /> AI Studio
                </span>
              ) : (
                <span className="text-[10px] text-slate-500 border border-slate-800 px-1 rounded flex items-center gap-1">
                   <Github size={8} /> Git
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 truncate mb-2">{repo.description}</p>
            <div className="flex items-center gap-3 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <GitBranch size={12} />
                {repo.branch}
              </div>
              <div className="flex items-center gap-1">
                <Star size={12} />
                {repo.stars}
              </div>
              {repo.openPrs > 0 && (
                <div className="flex items-center gap-1 text-green-600/70">
                  <GitPullRequest size={12} />
                  {repo.openPrs}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-800">
         <button 
          onClick={onSettingsClick}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-900 rounded-md transition-colors"
         >
          <Settings size={18} />
          Settings
        </button>
      </div>
    </div>
  );
};

export default Sidebar;