import React from 'react';
import { WorkflowStage } from '../types';
import { CheckCircle2, Circle, Loader2, UserCheck, PlayCircle } from 'lucide-react';

interface WorkflowStepsProps {
  currentStage: WorkflowStage;
}

const WorkflowSteps: React.FC<WorkflowStepsProps> = ({ currentStage }) => {
  const stages = [
    { id: WorkflowStage.REQUIREMENTS, label: 'Specs' },
    { id: WorkflowStage.PLANNING, label: 'Plan' },
    { id: WorkflowStage.CODING, label: 'Code' },
    { id: WorkflowStage.REVIEW, label: 'Review' },
    { id: WorkflowStage.CHECKS, label: 'CI/Build', icon: PlayCircle },
    { id: WorkflowStage.AWAITING_APPROVAL, label: 'Approve', icon: UserCheck },
    { id: WorkflowStage.DONE, label: 'Done' },
  ];

  const getStageStatus = (stageId: WorkflowStage) => {
    const stageOrder = stages.findIndex(s => s.id === stageId);
    // Determine current index based on stage
    let currentOrder = stages.findIndex(s => s.id === currentStage);
    
    // Handle DEPLOYING as effectively DONE for visual purposes regarding previous steps
    if (currentStage === WorkflowStage.DEPLOYING) {
        currentOrder = stages.findIndex(s => s.id === WorkflowStage.DONE) - 1; 
    }

    if (currentStage === WorkflowStage.DONE) return 'completed';
    if (stageOrder < currentOrder) return 'completed';
    if (stageOrder === currentOrder) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full py-6">
      <div className="flex justify-between items-center max-w-4xl mx-auto relative px-4">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10 transform -translate-y-[calc(50%+10px)]"></div>
        
        {stages.map((stage) => {
          const status = getStageStatus(stage.id);
          const Icon = stage.icon;
          
          return (
            <div key={stage.id} className="flex flex-col items-center gap-2 relative bg-slate-950 px-2 min-w-[80px]">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10
                ${status === 'completed' ? 'bg-green-900 border-green-500 text-green-400' : 
                  status === 'active' ? 'bg-blue-900 border-blue-500 text-blue-400 scale-110 shadow-lg shadow-blue-500/20' : 
                  'bg-slate-900 border-slate-700 text-slate-600'}
              `}>
                {status === 'completed' ? <CheckCircle2 size={20} /> : 
                 status === 'active' ? <Loader2 size={20} className="animate-spin" /> : 
                 Icon ? <Icon size={18} /> : <Circle size={20} />}
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${
                status === 'active' ? 'text-blue-400' : 
                status === 'completed' ? 'text-green-500/70' : 'text-slate-600'
              }`}>
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowSteps;