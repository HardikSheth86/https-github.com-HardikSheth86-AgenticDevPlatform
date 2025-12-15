import React from 'react';
import { Bot, Terminal, Code2, ShieldAlert, Workflow, Sparkles } from 'lucide-react';
import { AgentRole } from '../types';

// Define configuration interface
interface AgentConfig {
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  label: string;
  subLabel: string;
}

// Configuration map for each agent role
const AGENT_CONFIGS: Record<AgentRole, AgentConfig> = {
  [AgentRole.BMAD_ORCHESTRATOR]: { 
    icon: Sparkles, 
    color: 'text-white', 
    bg: 'bg-slate-800', 
    border: 'border-slate-600', 
    label: 'BMAD Engine',
    subLabel: 'Orchestrator'
  },
  [AgentRole.COPILOT_WORKSPACE]: { 
    icon: Bot, 
    color: 'text-purple-400', 
    bg: 'bg-purple-900/30', 
    border: 'border-purple-500', 
    label: 'Copilot Workspace',
    subLabel: 'Plan & Design'
  },
  [AgentRole.COPILOT_CORE]: { 
    icon: Code2, 
    color: 'text-blue-400', 
    bg: 'bg-blue-900/30', 
    border: 'border-blue-500', 
    label: 'Copilot Core',
    subLabel: 'Implementation'
  },
  [AgentRole.COPILOT_SECURITY]: { 
    icon: ShieldAlert, 
    color: 'text-orange-400', 
    bg: 'bg-orange-900/30', 
    border: 'border-orange-500', 
    label: 'Copilot Security',
    subLabel: 'Review & CodeQL'
  },
  [AgentRole.GITHUB_ACTIONS]: { 
    icon: Workflow, 
    color: 'text-green-400', 
    bg: 'bg-green-900/30', 
    border: 'border-green-500', 
    label: 'GitHub Actions',
    subLabel: 'CI/CD Runner'
  }
};

const DEFAULT_CONFIG: AgentConfig = { 
  icon: Terminal, 
  color: 'text-gray-400', 
  bg: 'bg-gray-800', 
  border: 'border-gray-600', 
  label: 'Agent', 
  subLabel: 'Idle' 
};

// Utility function to get config
const getAgentConfig = (role: AgentRole): AgentConfig => {
  return AGENT_CONFIGS[role] || DEFAULT_CONFIG;
};

interface AgentCardProps {
  role: AgentRole;
  isActive: boolean;
  statusMessage: string;
}

const AgentCard: React.FC<AgentCardProps> = ({ role, isActive, statusMessage }) => {
  const config = getAgentConfig(role);
  const Icon = config.icon;

  return (
    <div className={`
      relative p-4 rounded-xl border transition-all duration-500 flex flex-col justify-between min-h-[120px]
      ${isActive 
        ? `${config.border} ${config.bg} scale-105 shadow-xl shadow-black/40` 
        : 'border-slate-800 bg-slate-900/40 opacity-60 scale-95'}
    `}>
      <div className="flex items-start justify-between mb-2">
        <div className={`p-2 rounded-lg bg-slate-950/50 border border-white/5 ${config.color}`}>
          <Icon size={24} />
        </div>
        {isActive && (
           <div className="flex gap-1">
             <span className={`w-1.5 h-1.5 rounded-full ${config.color} animate-bounce`} style={{ animationDelay: '0ms' }}></span>
             <span className={`w-1.5 h-1.5 rounded-full ${config.color} animate-bounce`} style={{ animationDelay: '150ms' }}></span>
             <span className={`w-1.5 h-1.5 rounded-full ${config.color} animate-bounce`} style={{ animationDelay: '300ms' }}></span>
           </div>
        )}
      </div>
      
      <div>
        <h3 className={`font-bold text-sm ${config.color}`}>{config.label}</h3>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">{config.subLabel}</span>
      </div>
      
      {isActive && (
        <div className="mt-3 relative">
           <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite] -skew-x-12"></div>
           <div className="text-xs text-slate-300 truncate font-mono bg-black/20 p-1 rounded border border-white/5">
            {statusMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentCard;