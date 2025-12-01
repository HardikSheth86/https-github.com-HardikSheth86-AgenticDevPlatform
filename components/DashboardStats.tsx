import React from 'react';
import { GitPullRequest, CheckCircle2, Zap, Activity, Clock, ShieldCheck, GitBranch, ArrowUpRight } from 'lucide-react';

const DashboardStats: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
      
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <CheckCircle2 size={48} />
          </div>
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Total Tasks</div>
          <div className="text-3xl font-bold text-white mb-2">1,024</div>
          <div className="flex items-center text-green-400 text-xs gap-1">
             <ArrowUpRight size={12} /> +12% this week
          </div>
        </div>
        
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <GitPullRequest size={48} />
          </div>
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Merged PRs</div>
          <div className="text-3xl font-bold text-white mb-2">86</div>
          <div className="flex items-center text-blue-400 text-xs gap-1">
             <ArrowUpRight size={12} /> 4 pending
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck size={48} />
          </div>
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Security Score</div>
          <div className="text-3xl font-bold text-white mb-2">A+</div>
          <div className="flex items-center text-green-400 text-xs gap-1">
             <CheckCircle2 size={12} /> 0 Critical Issues
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap size={48} />
          </div>
          <div className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Velocity</div>
          <div className="text-3xl font-bold text-white mb-2">14.2</div>
          <div className="text-slate-500 text-xs">
             Tasks / Day
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
             <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} className="text-blue-400" /> Recent Activity
            </h3>
            <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">View All</button>
          </div>
          
          <div className="space-y-4">
            {[
              { msg: 'Merged PR #842: Fix responsive layout on login page', time: '2h ago', repo: 'e-commerce-platform', type: 'merge' },
              { msg: 'Generated 5 user stories for "Cart Optimization"', time: '5h ago', repo: 'Sapphire', type: 'story' },
              { msg: 'Build failed: Dependency resolution error', time: '8h ago', repo: 'data-pipeline-worker', type: 'error' },
              { msg: 'Deployed v2.1.0 to production', time: '1d ago', repo: 'auth-service', type: 'deploy' },
              { msg: 'Refactored database schema for user profiles', time: '2d ago', repo: 'Sapphire', type: 'code' }
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-4 p-3 hover:bg-slate-800/30 rounded-lg transition-colors group">
                 <div className={`mt-1 w-2 h-2 rounded-full ${
                    item.type === 'error' ? 'bg-red-500' :
                    item.type === 'merge' ? 'bg-purple-500' :
                    item.type === 'deploy' ? 'bg-green-500' : 'bg-blue-500'
                 }`}></div>
                 <div className="flex-1">
                    <div className="text-sm text-slate-300 font-medium group-hover:text-white transition-colors">{item.msg}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 mt-1">
                      <Clock size={10} /> {item.time} 
                      <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                      <span className="flex items-center gap-1"><GitBranch size={10} /> {item.repo}</span>
                    </div>
                 </div>
                 <button className="text-xs border border-slate-700 text-slate-400 px-2 py-1 rounded hover:bg-slate-700 hover:text-white transition-colors">Details</button>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
           <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-6 flex items-center gap-2">
              <Zap size={16} className="text-yellow-400" /> System Status
            </h3>
            <div className="space-y-6">
               <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                     <span>Agent Availability</span>
                     <span className="text-green-400">98%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                     <div className="h-full bg-green-500 w-[98%]"></div>
                  </div>
               </div>
               <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                     <span>API Quota Usage</span>
                     <span className="text-blue-400">45%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                     <div className="h-full bg-blue-500 w-[45%]"></div>
                  </div>
               </div>
               <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                     <span>Memory Utilization</span>
                     <span className="text-purple-400">32%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                     <div className="h-full bg-purple-500 w-[32%]"></div>
                  </div>
               </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-800">
               <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Active Agents</h4>
               <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => (
                     <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-xs text-slate-400 shadow-sm">
                        A{i}
                     </div>
                  ))}
                  <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-950 flex items-center justify-center text-xs text-slate-400 shadow-sm">
                     +5
                  </div>
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;