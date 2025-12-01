import React from 'react';
import { Bot, Brain, Code2, Search, Hammer } from 'lucide-react';
import { AgentRole } from '../types';

interface AgentCardProps {
  role: AgentRole;
  isActive: boolean;
  statusMessage: string;
}

const AgentCard: React.FC<AgentCardProps> = ({ role, isActive, statusMessage }) => {
  const getAgentConfig = (role: AgentRole) => {
    switch (role) {
      case AgentRole.PRODUCT_OWNER:
        return { icon: Brain, color: 'text-purple-400', bg: 'bg-purple-900/30', border: 'border-purple-500', label: 'Product Owner' };
      case AgentRole.ARCHITECT:
        return { icon: Search, color: 'text-blue-400', bg: 'bg-blue-900/30', border: 'border-blue-500', label: 'System Architect' };
      case AgentRole.DEVELOPER:
        return { icon: Code2, color: 'text-green-400', bg: 'bg-green-900/30', border: 'border-green-500', label: 'Code Agent' };
      case AgentRole.REVIEWER:
        return { icon: Search, color: 'text-orange-400', bg: 'bg-orange-900/30', border: 'border-orange-500', label: 'Reviewer' };
      case AgentRole.DEVOPS:
        return { icon: Hammer, color: 'text-red-400', bg: 'bg-red-900/30', border: 'border-red-500', label: 'Build Agent' };
      default:
        return { icon: Bot, color: 'text-gray-400', bg: 'bg-gray-800', border: 'border-gray-600', label: 'Agent' };
    }
  };

  const config = getAgentConfig(role);
  const Icon = config.icon;

  return (
    <div className={`
      relative p-4 rounded-xl border-2 transition-all duration-500
      ${isActive ? `${config.border} ${config.bg} scale-105 shadow-lg shadow-${config.color.replace('text-', '')}/20` : 'border-gray-800 bg-gray-900 opacity-50 scale-95'}
    `}>
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg bg-gray-900/50 ${config.color}`}>
          <Icon size={24} />
        </div>
        <div>
          <h3 className={`font-bold ${config.color}`}>{config.label}</h3>
          <span className="text-xs text-gray-400">{isActive ? 'Active' : 'Idle'}</span>
        </div>
      </div>
      
      {isActive && (
        <div className="mt-3 relative overflow-hidden">
          <div className="text-sm text-gray-300 animate-pulse">
            {statusMessage}
          </div>
          <div className="h-1 w-full bg-gray-700 mt-2 rounded-full overflow-hidden">
            <div className="h-full bg-current w-1/3 animate-[shimmer_1s_infinite] relative" style={{ color: config.color }}></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentCard;