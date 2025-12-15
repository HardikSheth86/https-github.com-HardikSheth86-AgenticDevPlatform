import React from 'react';
import { WorkflowStage } from '../types';
import { CheckCircle2, Circle, Loader2, UserCheck, PlayCircle, FileText, Trello, Code2, Rocket, RefreshCw } from 'lucide-react';

interface WorkflowStepsProps {
  currentStage: WorkflowStage;
}

const WorkflowSteps: React.FC<WorkflowStepsProps> = ({ currentStage }) => {
  // Define visual steps and map actual workflow stages to them
  const steps = [
    { 
      id: 'specs', 
      label: 'Specs', 
      icon: FileText,
      stages: [WorkflowStage.REQUIREMENTS, WorkflowStage.APPROVE_REQUIREMENTS] 
    },
    { 
      id: 'plan', 
      label: 'Plan', 
      icon: Trello,
      stages: [WorkflowStage.PLANNING, WorkflowStage.APPROVE_PLANNING] 
    },
    { 
      id: 'code', 
      label: 'Code', 
      icon: Code2,
      stages: [WorkflowStage.CODING, WorkflowStage.REVIEW, WorkflowStage.APPROVE_CODE, WorkflowStage.ONBOARDING] 
    },
    { 
      id: 'build', 
      label: 'Preview', 
      icon: PlayCircle,
      stages: [WorkflowStage.CHECKS, WorkflowStage.APPROVE_PREVIEW] 
    },
    { 
      id: 'deploy', 
      label: 'Deploy', 
      icon: Rocket,
      stages: [WorkflowStage.DEPLOYING, WorkflowStage.DONE] 
    },
  ];

  const getStepStatus = (stepStages: WorkflowStage[]) => {
    // If the entire workflow is DONE, mark everything as completed
    if (currentStage === WorkflowStage.DONE) return 'completed';

    // Current active stage index in the global enum order isn't strictly necessary if we check inclusion
    // but we need to know if a step is "past".
    
    // Simplification: Define a linear order of "done-ness"
    const stageOrder = [
      WorkflowStage.IDLE,
      WorkflowStage.REQUIREMENTS, WorkflowStage.APPROVE_REQUIREMENTS,
      WorkflowStage.PLANNING, WorkflowStage.APPROVE_PLANNING,
      WorkflowStage.ONBOARDING, // Insert onboarding here in logical flow
      WorkflowStage.CODING, WorkflowStage.REVIEW, WorkflowStage.APPROVE_CODE,
      WorkflowStage.CHECKS, WorkflowStage.APPROVE_PREVIEW,
      WorkflowStage.DEPLOYING, WorkflowStage.DONE
    ];

    const currentIndex = stageOrder.indexOf(currentStage);
    const stepMaxIndex = Math.max(...stepStages.map(s => stageOrder.indexOf(s)));

    if (stepStages.includes(currentStage)) {
        // Check if it's an approval stage within this step (effectively "done" with the active work, waiting on user)
        if (currentStage.toString().startsWith('APPROVE') && stepStages.length > 0) {
            return 'waiting'; 
        }
        return 'active';
    }
    if (currentIndex > stepMaxIndex) return 'completed';
    return 'pending';
  };

  return (
    <div className="w-full py-6">
      <div className="flex justify-between items-center max-w-4xl mx-auto relative px-4">
        {/* Connecting Line */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-800 -z-10 transform -translate-y-[calc(50%+10px)]"></div>
        
        {steps.map((step) => {
          const status = getStepStatus(step.stages);
          const Icon = step.icon;
          const isSpecialOnboarding = currentStage === WorkflowStage.ONBOARDING && step.id === 'code';
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-2 relative bg-slate-950 px-2 min-w-[80px]">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500 z-10
                ${status === 'completed' ? 'bg-green-900 border-green-500 text-green-400' : 
                  status === 'active' ? 'bg-blue-900 border-blue-500 text-blue-400 scale-110 shadow-lg shadow-blue-500/20' : 
                  status === 'waiting' ? 'bg-yellow-900/50 border-yellow-500 text-yellow-400 scale-110 shadow-lg shadow-yellow-500/20' :
                  'bg-slate-900 border-slate-700 text-slate-600'}
              `}>
                {status === 'completed' ? <CheckCircle2 size={20} /> : 
                 status === 'active' ? (isSpecialOnboarding ? <RefreshCw size={20} className="animate-spin" /> : <Loader2 size={20} className="animate-spin" />) : 
                 status === 'waiting' ? <UserCheck size={20} className="animate-pulse" /> :
                 Icon ? <Icon size={18} /> : <Circle size={20} />}
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-wider ${
                status === 'active' ? 'text-blue-400' : 
                status === 'waiting' ? 'text-yellow-400' :
                status === 'completed' ? 'text-green-500/70' : 'text-slate-600'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkflowSteps;