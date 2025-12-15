import React from 'react';
import { GitPullRequest, CheckCircle2, Zap, Activity, Clock, ShieldCheck, GitBranch, ArrowUpRight, Code, Trophy } from 'lucide-react';

const DashboardStats: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
      
      {/* Accomplishments Summary - New Section */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
           <Trophy size={18} className="text-yellow-500" /> 
           Lifetime Accomplishments
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
           {/* Features Completed */}
           <div className="bg-gradient-to-br from-blue-900/30 to-slate-900 border border-blue-500/20 p-6 rounded-xl relative overflow-hidden group hover:border-blue-500/40 transition-all">
              <div className="absolute -right-6 -top-6 bg-blue-500/10 w-32 h-32 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all"></div>
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 border border-blue-500/30">
                       <GitPullRequest size={20} />
                    </div>
                    <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Features Completed</span>
                 </div>
                 <div className="flex items-baseline gap-2">
                    <div className="text-4xl font-bold text-white tracking-tight">142</div>
                    <div className="text-xs text-blue-300/60 font-medium">+8 this week</div>
                 </div>
              </div>
           </div>

           {/* Code Generated */}
           <div className="bg-gradient-to-br from-purple-900/30 to-slate-900 border border-purple-500/20 p-6 rounded-xl relative overflow-hidden group hover:border-purple-500/40 transition-all">
              <div className="absolute -right-6 -top-6 bg-purple-500/10 w-32 h-32 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all"></div>
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 border border-purple-500/30">
                       <Code size={20} />
                    </div>
                    <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Code Generated</span>
                 </div>
                 <div className="flex items-baseline gap-2">
                    <div className="text-4xl font-bold text-white tracking-tight">1.2M</div>
                    <div className="text-xs text-purple-300/60 font-medium">Lines of code</div>
                 </div>
              </div>
           </div>

           {/* Tests Passed */}
           <div className="bg-gradient-to-br from-green-900/30 to-slate-900 border border-green-500/20 p-6 rounded-xl relative overflow-hidden group hover:border-green-500/40 transition-all">
              <div className="absolute -right-6 -top-6 bg-green-500/10 w-32 h-32 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all"></div>
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-500/20 rounded-lg text-green-400 border border-green-500/30">
                       <CheckCircle2 size={20} />
                    </div>
                    <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Tests Passed</span>
                 </div>
                 <div className="flex items-baseline gap-2">
                    <div className="text-4xl font-bold text-white tracking-tight">4,892</div>
                    <div className="text-xs text-green-300/60 font-medium">94% Coverage Avg</div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:bg-slate-800/50 transition-colors">
          <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Active Tasks</div>
          <div className="text-2xl font-bold text-white">12</div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:bg-slate-800/50 transition-colors">
           <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Security Score</div>
           <div className="text-2xl font-bold text-green-400">A+</div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:bg-slate-800/50 transition-colors">
           <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Velocity</div>
           <div className="text-2xl font-bold text-white">14.2</div>
        </div>
        <div className="bg-slate-900/50 border border-slate-800 p-4 rounded-xl flex flex-col justify-between hover:bg-slate-800/50 transition-colors">
           <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-2">Active Agents</div>
           <div className="text-2xl font-bold text-purple-400">5</div>
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
                 <button className="text-xs border border-slate-700 text-slate-400 px-2 py-1 rounded hover:bg-slate-700 hover:text-white transition-colors opacity-0 group-hover:opacity-100">Details</button>
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