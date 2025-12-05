import React, { useState, useCallback } from 'react';
import { 
  AgentRole, 
  WorkflowStage, 
  UserStory, 
  DevTask, 
  CodeFile, 
  AgentLog, 
  CodeReviewComment,
  Repository,
  PullRequest
} from './types';
import { geminiService } from './services/geminiService';
import AgentCard from './components/AgentCard';
import LogTerminal from './components/LogTerminal';
import WorkflowSteps from './components/WorkflowSteps';
import Tabs from './components/Tabs';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import DashboardStats from './components/DashboardStats';
import { Send, FileText, Code, Brain, GitPullRequest, Terminal, CheckCircle, CheckCircle2, Sparkles, UserCheck, ExternalLink, ArrowRight, XCircle, RotateCcw, MessageSquare, FolderPlus, Rocket } from 'lucide-react';

// Mock Data
const MOCK_REPOS: Repository[] = [
  { id: '5', name: 'Sapphire', description: 'Enterprise AI Agent (Google Studio)', language: 'Python', stars: 12, openPrs: 2, branch: 'main', source: 'google-studio' },
  { id: '1', name: 'e-commerce-platform', description: 'Next.js storefront with Stripe integration', language: 'TypeScript', stars: 124, openPrs: 3, branch: 'main', source: 'github' },
  { id: '2', name: 'data-pipeline-worker', description: 'Python ETL service for analytics', language: 'Python', stars: 45, openPrs: 0, branch: 'develop', source: 'github' },
  { id: '3', name: 'auth-service', description: 'Go microservice for authentication', language: 'Go', stars: 89, openPrs: 1, branch: 'master', source: 'github' },
  { id: '4', name: 'mobile-app-react-native', description: 'Cross-platform customer loyalty app', language: 'TypeScript', stars: 210, openPrs: 5, branch: 'main', source: 'github' }
];

export default function App() {
  // --- State ---
  const [input, setInput] = useState('');
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>('5'); // Default to Sapphire
  const [stage, setStage] = useState<WorkflowStage>(WorkflowStage.IDLE);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Artifacts
  const [stories, setStories] = useState<UserStory[]>([]);
  const [tasks, setTasks] = useState<DevTask[]>([]);
  const [codeFiles, setCodeFiles] = useState<CodeFile[]>([]);
  const [reviews, setReviews] = useState<CodeReviewComment[]>([]);
  const [prDetails, setPrDetails] = useState<PullRequest | null>(null);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [featureBranch, setFeatureBranch] = useState<string>('');
  const [summary, setSummary] = useState<string[]>([]);
  
  // Approval / Rework State
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);
  const [changeRequestFeedback, setChangeRequestFeedback] = useState('');

  // Logs
  const [logs, setLogs] = useState<AgentLog[]>([]);
  
  // UI
  const [activeTab, setActiveTab] = useState('stories');

  // Derived State
  const selectedRepo = selectedRepoId ? MOCK_REPOS.find(r => r.id === selectedRepoId) : null;

  // --- Helper Functions ---
  
  const addLog = useCallback((role: AgentRole, message: string, type: AgentLog['type'] = 'info') => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: Date.now(),
      role,
      message,
      type
    }]);
  }, []);

  const addBuildLog = (msg: string) => {
    setBuildLogs(prev => [...prev, msg]);
  };

  const getActiveAgentRole = (currentStage: WorkflowStage): AgentRole | null => {
    switch (currentStage) {
      case WorkflowStage.REQUIREMENTS: 
      case WorkflowStage.APPROVE_REQUIREMENTS:
        return AgentRole.PRODUCT_OWNER;
      
      case WorkflowStage.PLANNING: 
      case WorkflowStage.APPROVE_PLANNING:
        return AgentRole.ARCHITECT;
      
      case WorkflowStage.CODING: return AgentRole.DEVELOPER;
      case WorkflowStage.REVIEW: return AgentRole.REVIEWER;
      case WorkflowStage.APPROVE_CODE: return AgentRole.REVIEWER;
      
      case WorkflowStage.CHECKS: 
      case WorkflowStage.APPROVE_PREVIEW:
        return AgentRole.DEVOPS;
      
      case WorkflowStage.DEPLOYING: return AgentRole.DEVOPS;
      default: return null;
    }
  };

  // --- Workflow Orchestration ---

  const startWorkflow = async () => {
    if (!input.trim()) return;
    if (!process.env.API_KEY) {
        alert("API Key missing in environment.");
        return;
    }

    setStage(WorkflowStage.REQUIREMENTS);
    setLogs([]);
    setStories([]);
    setTasks([]);
    setCodeFiles([]);
    setReviews([]);
    setPrDetails(null);
    setBuildLogs([]);
    setActiveTab('stories');
    setFeatureBranch('');
    setSummary([]);
    setIsRequestingChanges(false);
    setChangeRequestFeedback('');

    await runRequirements();
  };

  // PHASE 1: Requirements
  const runRequirements = async () => {
    setStage(WorkflowStage.REQUIREMENTS);
    setActiveTab('stories');
    try {
      addLog(AgentRole.PRODUCT_OWNER, `Analyzing request for ${selectedRepo ? selectedRepo.name : 'new project'}: "${input}"`);
      const generatedStories = await geminiService.generateUserStories(input + (changeRequestFeedback ? `\nFeedback: ${changeRequestFeedback}` : ''), selectedRepo || undefined);
      setStories(generatedStories);
      addLog(AgentRole.PRODUCT_OWNER, `Generated ${generatedStories.length} user stories.`, 'success');
      setStage(WorkflowStage.APPROVE_REQUIREMENTS);
    } catch (e: any) {
      addLog(AgentRole.PRODUCT_OWNER, `Failed to generate stories: ${e.message}`, 'error');
      setStage(WorkflowStage.IDLE);
    }
  };

  // PHASE 2: Planning
  const runPlanning = async () => {
    setStage(WorkflowStage.PLANNING);
    setActiveTab('tasks');
    setChangeRequestFeedback(''); // Clear feedback
    try {
      addLog(AgentRole.ARCHITECT, "Mapping stories to Jira tasks...");
      const generatedTasks = await geminiService.generateDevTasks(stories);
      setTasks(generatedTasks);
      addLog(AgentRole.ARCHITECT, `Created ${generatedTasks.length} tickets.`, 'success');
      
      const branchBase = generatedTasks[0]?.key.toLowerCase() || 'project';
      const branchName = `feature/${branchBase}-v${Math.floor(Math.random() * 100)}`;
      setFeatureBranch(branchName);
      setStage(WorkflowStage.APPROVE_PLANNING);
    } catch (e: any) {
      addLog(AgentRole.ARCHITECT, `Failed to plan: ${e.message}`, 'error');
    }
  };

  // PHASE 3: Coding & Testing
  const runCoding = async () => {
    setStage(WorkflowStage.CODING);
    setActiveTab('code');
    setChangeRequestFeedback('');
    try {
      addLog(AgentRole.DEVELOPER, `Initializing workspace on ${featureBranch}...`);
      
      // Fast forward tasks animation
      for (const task of tasks) {
          setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'IN_PROGRESS' } : t));
          await new Promise(r => setTimeout(r, 200)); 
      }

      addLog(AgentRole.DEVELOPER, "Writing code implementation...");
      const files = await geminiService.generateCode(tasks, input, selectedRepo || undefined);
      setCodeFiles(files);
      setTasks(prev => prev.map(t => ({ ...t, status: 'CODE_REVIEW' })));
      addLog(AgentRole.DEVELOPER, `Implemented changes in ${files.length} files.`, 'success');
      await new Promise(r => setTimeout(r, 1000));

      // Unit Tests Simulation
      addLog(AgentRole.DEVELOPER, "Generating unit tests...");
      await new Promise(r => setTimeout(r, 800));
      addLog(AgentRole.DEVELOPER, "Running unit tests: 12/12 passed.", 'success');

      // Code Review
      setStage(WorkflowStage.REVIEW);
      setActiveTab('pr');
      addLog(AgentRole.REVIEWER, "Running static code analysis...");
      const codeReviews = await geminiService.reviewCode(files);
      setReviews(codeReviews);
      
      if (codeReviews.length === 0 || codeReviews.every(r => r.severity === 'LOW')) {
          addLog(AgentRole.REVIEWER, "Code review passed.", 'success');
      } else {
          addLog(AgentRole.REVIEWER, `Found ${codeReviews.length} issues to review.`, 'warning');
      }
      
      setStage(WorkflowStage.APPROVE_CODE);
    } catch (e: any) {
      addLog(AgentRole.DEVELOPER, `Coding failed: ${e.message}`, 'error');
    }
  };

  // PHASE 4: Build & Preview
  const runChecks = async () => {
    setStage(WorkflowStage.CHECKS);
    setActiveTab('build');
    setChangeRequestFeedback('');
    
    // Create Mock PR structure if not exists
    if (!prDetails) {
        setPrDetails({
            id: Math.floor(Math.random() * 1000).toString(),
            title: `Feature: ${input.substring(0, 40)}...`,
            fromBranch: featureBranch || 'feature/update',
            toBranch: selectedRepo?.branch || 'main',
            description: `Implements user stories: ${stories.map(s => s.id).join(', ')}`,
            status: 'OPEN',
            filesChanged: codeFiles.length,
            checks: [
            { name: 'ci/lint', status: 'PENDING' },
            { name: 'ci/test', status: 'PENDING' },
            { name: 'ci/security', status: 'PENDING' }
            ]
        });
    }

    try {
      addLog(AgentRole.DEVOPS, `Starting feature build on ${featureBranch}...`);
      const buildSteps = [
          "Initializing build agent...",
          "Cloning repository...",
          "Installing dependencies...",
          "Running linter...",
          "Running integration tests...",
          "Building preview artifacts...",
          "Deploying to preview environment..."
      ];

      for (const step of buildSteps) {
          addBuildLog(`[${new Date().toISOString().split('T')[1].split('.')[0]}] ${step}`);
          await new Promise(r => setTimeout(r, 400));
      }

      addLog(AgentRole.DEVOPS, "Build successful. Preview environment ready.", 'success');
      
      setPrDetails(prev => prev ? ({
          ...prev,
          checks: [
              { name: 'ci/lint', status: 'PASS' },
              { name: 'ci/test', status: 'PASS' },
              { name: 'ci/security', status: 'PASS' }
          ]
      }) : null);

      setActiveTab('preview');
      setStage(WorkflowStage.APPROVE_PREVIEW);
    } catch (e: any) {
      addLog(AgentRole.DEVOPS, `Build failed: ${e.message}`, 'error');
    }
  };

  // PHASE 5: Deploy to UAT/Prod
  const runDeployment = async () => {
    setStage(WorkflowStage.DEPLOYING);
    setChangeRequestFeedback('');
    try {
      addLog(AgentRole.DEVOPS, `Merging PR #${prDetails?.id} to ${selectedRepo?.branch || 'main'}...`);
      await new Promise(r => setTimeout(r, 1000));
      
      setTasks(prev => prev.map(t => ({ ...t, status: 'DONE' })));
      setPrDetails(prev => prev ? ({ ...prev, status: 'MERGED' }) : null);
      
      addLog(AgentRole.DEVOPS, "Merge complete.", 'success');
      addLog(AgentRole.DEVOPS, "Deploying to UAT environment...", 'info');
      await new Promise(r => setTimeout(r, 1500));
      addLog(AgentRole.DEVOPS, "UAT Deployment Successful.", 'success');
      
      setSummary([
         `Implemented ${stories.length} user stories`,
         `Merged PR #${prDetails?.id} into ${selectedRepo?.branch || 'main'}`,
         `Verified ${tasks.length} tasks`,
         `Deployed to UAT for final acceptance`
      ]);
      
      setStage(WorkflowStage.DONE);
      setActiveTab('done');
    } catch (e: any) {
       addLog(AgentRole.DEVOPS, `Deploy failed: ${e.message}`, 'error');
    }
  };

  // --- Handlers ---

  const handleApprove = () => {
    switch (stage) {
      case WorkflowStage.APPROVE_REQUIREMENTS:
        runPlanning();
        break;
      case WorkflowStage.APPROVE_PLANNING:
        runCoding();
        break;
      case WorkflowStage.APPROVE_CODE:
        runChecks();
        break;
      case WorkflowStage.APPROVE_PREVIEW:
        runDeployment();
        break;
    }
  };

  const handleDiscard = () => {
     if(confirm("Are you sure you want to discard all changes and stop the workflow?")) {
        setStage(WorkflowStage.IDLE);
        setLogs([]);
     }
  };

  const handleSubmitRework = () => {
     if (!changeRequestFeedback.trim()) return;
     
     addLog(AgentRole.PRODUCT_OWNER, `Feedback received: "${changeRequestFeedback}". Reworking...`, 'warning');
     
     const currentStage = stage;
     setIsRequestingChanges(false);
     
     // Route back based on current approval stage
     if (currentStage === WorkflowStage.APPROVE_REQUIREMENTS) {
        runRequirements();
     } else if (currentStage === WorkflowStage.APPROVE_PLANNING) {
        runPlanning();
     } else if (currentStage === WorkflowStage.APPROVE_CODE) {
        runCoding(); // Re-run coding with feedback
     } else if (currentStage === WorkflowStage.APPROVE_PREVIEW) {
        runCoding(); // Go back to coding if preview is rejected
     }
  };

  // --- UI Helpers ---

  const getApprovalContext = () => {
    switch(stage) {
      case WorkflowStage.APPROVE_REQUIREMENTS:
        return { 
          title: "Review User Stories", 
          desc: "Confirm requirements before planning.",
          btn: "Approve Stories",
          tab: "stories"
        };
      case WorkflowStage.APPROVE_PLANNING:
        return { 
          title: "Review Development Plan", 
          desc: "Confirm Jira tasks before coding.",
          btn: "Approve Plan",
          tab: "tasks"
        };
      case WorkflowStage.APPROVE_CODE:
        return { 
          title: "Review Code & Tests", 
          desc: "Verify implementation and test results.",
          btn: "Approve Code",
          tab: "pr" // or code
        };
      case WorkflowStage.APPROVE_PREVIEW:
        return { 
          title: "Verify Feature Preview", 
          desc: "Check the deployed feature in the preview environment.",
          btn: "Merge & Deploy UAT",
          tab: "preview"
        };
      default:
        return null;
    }
  };

  const approvalCtx = getApprovalContext();
  const isApprovalStage = !!approvalCtx;
  const activeRole = getActiveAgentRole(stage);

  // --- Render ---

  const renderContent = () => {
    switch (activeTab) {
      case 'stories':
        return (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 pb-24">
            {stories.length === 0 && <div className="text-slate-500 p-4 italic">Waiting for Product Owner...</div>}
            {stories.map(story => (
              <div key={story.id} className="bg-slate-900 border border-slate-800 p-4 rounded-lg hover:border-slate-700 transition-colors">
                <div className="flex justify-between items-start mb-2">
                   <h4 className="font-bold text-purple-400">{story.title}</h4>
                   <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">{story.id}</span>
                </div>
                <p className="text-sm text-slate-300 mb-4">{story.description}</p>
                <div className="bg-slate-950/50 p-2 rounded text-xs text-slate-400 border border-slate-800/50">
                  <strong>Acceptance Criteria:</strong>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {story.acceptanceCriteria.map((ac, i) => <li key={i}>{ac}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        );
      case 'tasks':
        return (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3 pb-24">
             {tasks.length === 0 && <div className="text-slate-500 p-4 italic">Waiting for Architect...</div>}
             {['TODO', 'IN_PROGRESS', 'CODE_REVIEW', 'DONE'].map(status => {
                const statusTasks = tasks.filter(t => t.status === status);
                if(status === 'TODO' && statusTasks.length === 0 && tasks.length > 0) return null;
                
                return (
                   <div key={status} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{status.replace('_', ' ')}</h3>
                        <span className="text-xs bg-slate-800 text-slate-500 px-1.5 rounded">{statusTasks.length}</span>
                      </div>
                      {statusTasks.map(task => (
                        <div key={task.id} className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-sm border-l-4 border-l-blue-500 group hover:border-slate-700 transition-all">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-mono text-blue-400 bg-blue-900/20 px-1 rounded">{task.key}</span>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500">
                               <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center">D</div>
                               {task.assignee}
                            </div>
                          </div>
                          <p className="text-sm font-medium text-slate-200 leading-tight group-hover:text-blue-300 transition-colors">{task.title}</p>
                        </div>
                      ))}
                   </div>
                )
             })}
          </div>
        );
      case 'code':
        return (
          <div className="space-y-4 pb-24">
             {codeFiles.length === 0 && <div className="text-slate-500 p-4 italic">Waiting for Developer...</div>}
             {codeFiles.map((file, idx) => (
               <div key={idx} className="bg-slate-950 border border-slate-800 rounded-lg overflow-hidden group">
                 <div className="bg-slate-900 px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-800 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <FileText size={14} className="text-blue-400" /> 
                      {file.path}
                   </div>
                   <span className="text-[10px] uppercase text-slate-600">{file.language}</span>
                 </div>
                 <pre className="p-4 overflow-x-auto text-sm font-mono text-blue-100 leading-relaxed">
                   <code>{file.content}</code>
                 </pre>
               </div>
             ))}
          </div>
        );
      case 'pr':
        if (!reviews.length && !prDetails) return <div className="text-slate-500 p-4 italic">Waiting for Code...</div>;
        return (
          <div className="space-y-6 pb-24"> 
            <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
              {prDetails && (
              <div className="p-6 border-b border-slate-800">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${
                      prDetails.status === 'OPEN' ? 'bg-green-900/30 text-green-400 border-green-800' : 'bg-purple-900/30 text-purple-400 border-purple-800'
                    }`}>
                      <GitPullRequest size={16} className="inline mr-1" /> 
                      {prDetails.status}
                    </div>
                    <h2 className="text-xl font-semibold text-slate-100">
                      {prDetails.title} <span className="text-slate-500">#{prDetails.id}</span>
                    </h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400 font-mono">
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-blue-300">{prDetails.fromBranch}</span>
                    <span>→</span>
                    <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">{prDetails.toBranch}</span>
                </div>
              </div>
              )}

              <div className="flex flex-col lg:flex-row">
                <div className="flex-1 p-6 space-y-6">
                    {prDetails && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-200 mb-2">Checks</h3>
                      <div className="space-y-2">
                        {prDetails.checks.map((check, i) => (
                            <div key={i} className="flex items-center justify-between bg-slate-950 p-2 rounded border border-slate-800">
                              <span className="flex items-center gap-2 text-sm text-slate-300">
                                  <div className={`w-2 h-2 rounded-full ${
                                    check.status === 'PASS' ? 'bg-green-500' : 
                                    check.status === 'FAIL' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'
                                  }`}></div>
                                  {check.name}
                              </span>
                              <span className="text-xs text-slate-500 font-mono">{check.status}</span>
                            </div>
                        ))}
                      </div>
                    </div>
                    )}
                    
                    {/* Explicit Unit Test Section */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-200 mb-2">Unit Tests</h3>
                        <div className="bg-slate-950 p-3 rounded border border-slate-800 text-sm font-mono text-green-400">
                           <div className="flex items-center gap-2 mb-1"><CheckCircle size={14}/> auth.test.ts (4/4 passed)</div>
                           <div className="flex items-center gap-2 mb-1"><CheckCircle size={14}/> user.test.ts (2/2 passed)</div>
                           <div className="flex items-center gap-2"><CheckCircle size={14}/> api.test.ts (6/6 passed)</div>
                        </div>
                    </div>
                </div>

                {/* Reviews Sidebar */}
                <div className="w-full lg:w-80 bg-slate-950/30 border-l border-slate-800 p-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      AI Reviewer
                      <span className="bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded text-[10px]">{reviews.length}</span>
                    </h3>
                    {reviews.length === 0 && <p className="text-sm text-slate-500">No comments.</p>}
                    {reviews.map((rev, idx) => (
                      <div key={idx} className={`p-3 rounded border text-sm ${
                        rev.severity === 'HIGH' ? 'border-red-900/50 bg-red-900/5' : 
                        'border-slate-800 bg-slate-900'
                      }`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-mono text-xs text-slate-500 truncate max-w-[120px]">{rev.file}</span>
                          <span className={`text-[10px] px-1.5 rounded ${
                              rev.severity === 'HIGH' ? 'bg-red-900 text-red-200' : 'bg-blue-900 text-blue-200'
                          }`}>{rev.severity}</span>
                        </div>
                        <p className="text-slate-300 mb-2">{rev.comment}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'build':
        return (
          <div className="bg-black rounded-lg border border-slate-800 overflow-hidden font-mono text-sm shadow-2xl pb-24">
             <div className="bg-slate-900 p-2 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Terminal size={14} className="text-slate-400" />
                   <span className="text-slate-400">Build Log: {featureBranch}</span>
                </div>
                {stage === WorkflowStage.CHECKS && (
                   <div className="flex items-center gap-2 text-yellow-500 text-xs">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      Running CI
                   </div>
                )}
                 {(stage === WorkflowStage.APPROVE_PREVIEW || stage === WorkflowStage.DONE) && (
                   <div className="flex items-center gap-2 text-green-500 text-xs">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Success
                   </div>
                )}
             </div>
             <div className="p-4 h-[400px] overflow-y-auto space-y-1">
                {buildLogs.length === 0 && <div className="text-slate-600">Waiting for build agent...</div>}
                {buildLogs.map((log, i) => (
                   <div key={i} className="text-slate-300 break-all">
                      <span className="text-slate-600 mr-2">$</span>{log}
                   </div>
                ))}
             </div>
          </div>
        );
      case 'preview':
        return (
          <div className="h-96 bg-slate-100 rounded-lg border border-slate-800 flex items-center justify-center text-slate-900 relative overflow-hidden pb-24">
             {(stage === WorkflowStage.APPROVE_PREVIEW || stage === WorkflowStage.DONE || stage === WorkflowStage.DEPLOYING) ? (
               <div className="text-center animate-in zoom-in duration-500">
                 <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-blue-500/20">
                   <ExternalLink size={40} />
                 </div>
                 <h3 className="text-3xl font-bold text-slate-800 mb-2">Feature Preview</h3>
                 <p className="text-slate-600 max-w-md mx-auto mb-6">
                    Running <span className="font-mono font-bold text-slate-800 bg-slate-200 px-1 rounded">{featureBranch}</span>
                 </p>
                 <div className="bg-white rounded-lg shadow-sm border border-slate-200 text-left max-w-sm mx-auto overflow-hidden">
                    <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 text-xs font-mono text-slate-500">Preview URL</div>
                    <div className="p-4 flex items-center gap-2 group cursor-pointer hover:bg-blue-50 transition-colors">
                       <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                       <span className="text-blue-600 font-medium truncate">https://{selectedRepo?.name || 'app'}-{featureBranch.replace('feature/', '')}.agentic.dev</span>
                    </div>
                 </div>
               </div>
             ) : (
               <div className="flex flex-col items-center text-slate-400">
                  <Rocket size={64} className="mb-6 opacity-10" />
                  <p>Deployment pending...</p>
               </div>
             )}
          </div>
        );
      case 'done':
          return (
             <div className="p-8 text-center animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 ring-4 ring-green-500/20">
                   <Sparkles size={48} />
                </div>
                <h2 className="text-3xl font-bold text-white mb-2">Workflow Complete</h2>
                <p className="text-slate-400 mb-8">All agents have finished their tasks successfully.</p>
                
                <div className="max-w-xl mx-auto bg-slate-950 border border-slate-800 rounded-xl overflow-hidden text-left">
                   <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 font-bold text-slate-300">
                      Execution Summary
                   </div>
                   <div className="p-4 space-y-3">
                      {summary.map((item, i) => (
                         <div key={i} className="flex items-center gap-3 text-slate-300">
                            <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                            <span>{item}</span>
                         </div>
                      ))}
                   </div>
                </div>

                <button 
                  onClick={() => setStage(WorkflowStage.IDLE)}
                  className="mt-8 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 mx-auto"
                >
                   Start New Task <ArrowRight size={16} />
                </button>
             </div>
          );
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 selection:bg-blue-500/30 font-sans">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      {/* Sidebar */}
      <Sidebar 
        repos={MOCK_REPOS} 
        selectedRepoId={selectedRepoId} 
        onSelectRepo={(id) => {
           if (stage === WorkflowStage.IDLE || stage === WorkflowStage.DONE) {
             setSelectedRepoId(id);
           }
        }} 
        onSettingsClick={() => setIsSettingsOpen(true)}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-8 flex-shrink-0">
          <div>
            <h2 className="font-bold text-lg text-white flex items-center gap-2">
              {selectedRepo ? (
                <>
                  <span className="text-slate-500 font-normal">
                     {selectedRepo.source === 'google-studio' ? 'AI Studio Project' : 'Repository'} /
                  </span> 
                  {selectedRepo.name}
                  {selectedRepo.source === 'google-studio' && (
                     <span className="bg-purple-600 text-[10px] px-1.5 py-0.5 rounded text-white ml-2 shadow-lg shadow-purple-900/50 flex items-center gap-1">
                        <Sparkles size={8} /> LIVE
                     </span>
                  )}
                </>
              ) : (
                <>
                  <span className="text-slate-500 font-normal">
                     Workspace /
                  </span> 
                  New Project
                   <span className="bg-blue-600 text-[10px] px-1.5 py-0.5 rounded text-white ml-2 shadow-lg shadow-blue-900/50 flex items-center gap-1">
                        <FolderPlus size={8} /> CREATE
                   </span>
                </>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-400">
             {selectedRepo && (
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-slate-800">
                  <GitPullRequest size={14} />
                  <span>{selectedRepo.openPrs} Active PRs</span>
                </div>
             )}
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${stage === WorkflowStage.IDLE || stage === WorkflowStage.DONE ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
               Agent System: {stage === WorkflowStage.IDLE ? 'Ready' : 'Busy'}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Input Section */}
            <section className="max-w-3xl mx-auto">
              {stage === WorkflowStage.IDLE && (
                 <>
                  <h1 className="text-3xl font-bold text-center mb-3 text-white">
                    {selectedRepo ? `Upgrade ${selectedRepo.name}` : "Create New Project"}
                  </h1>
                  <p className="text-center text-slate-400 mb-8">
                    {selectedRepo 
                      ? "Describe the feature, bugfix, or refactor you want the agents to perform." 
                      : "Describe your application idea. We will generate user stories, a plan, and initial code."}
                  </p>
                 </>
              )}
              
              <div className={`relative group transition-all duration-500 ${stage !== WorkflowStage.IDLE ? 'scale-90 opacity-80 pointer-events-none' : 'scale-100'}`}>
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <div className="relative bg-slate-900 rounded-xl p-1 flex items-center shadow-2xl">
                  <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={selectedRepo ? "e.g., Add dark mode support to the user settings page..." : "e.g., A kanban board for cookie recipes..."} 
                    className="w-full bg-transparent border-none px-6 py-4 text-lg focus:outline-none focus:ring-0 text-white placeholder-slate-600"
                    onKeyDown={(e) => e.key === 'Enter' && stage === WorkflowStage.IDLE && startWorkflow()}
                    disabled={stage !== WorkflowStage.IDLE && stage !== WorkflowStage.DONE}
                  />
                  <button 
                    onClick={() => startWorkflow()}
                    disabled={stage !== WorkflowStage.IDLE && stage !== WorkflowStage.DONE}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mx-2 shadow-lg shadow-blue-900/20"
                  >
                    {stage === WorkflowStage.IDLE || stage === WorkflowStage.DONE ? (
                      <>Generate <Send size={18} /></>
                    ) : (
                      <>Working...</>
                    )}
                  </button>
                </div>
              </div>

               {/* IDLE STATE DASHBOARD */}
               {stage === WorkflowStage.IDLE && (
                 <div className="mt-12">
                   <DashboardStats />
                 </div>
               )}
            </section>

            {/* Agent Status Grid */}
            {stage !== WorkflowStage.IDLE && (
              <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <AgentCard role={AgentRole.PRODUCT_OWNER} isActive={activeRole === AgentRole.PRODUCT_OWNER} statusMessage="Defining requirements..." />
                <AgentCard role={AgentRole.ARCHITECT} isActive={activeRole === AgentRole.ARCHITECT} statusMessage="Planning solution..." />
                <AgentCard role={AgentRole.DEVELOPER} isActive={activeRole === AgentRole.DEVELOPER} statusMessage="Implementing..." />
                <AgentCard role={AgentRole.DEVOPS} isActive={activeRole === AgentRole.DEVOPS} statusMessage="Building & Checking..." />
                <AgentCard role={AgentRole.REVIEWER} isActive={activeRole === AgentRole.REVIEWER} statusMessage="Auditing code..." />
              </section>
            )}

            {/* Main Workspace */}
            {stage !== WorkflowStage.IDLE && (
              <section className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <WorkflowSteps currentStage={stage} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Panel: Logs */}
                  <div className="lg:col-span-1 space-y-4 h-full flex flex-col">
                    <LogTerminal logs={logs} />
                    <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-sm text-slate-400 flex-1">
                        <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Brain size={16} /> Context Awareness</h4>
                        <p className="italic opacity-70 leading-relaxed">
                          {selectedRepo 
                            ? `Agents are operating in context of "${selectedRepo.name}". Code generation adheres to existing patterns in ${selectedRepo.language}.`
                            : "Agents are bootstrapping a fresh project structure based on industry best practices."}
                        </p>
                        <div className="mt-4 flex items-center gap-2">
                           <div className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-300">Gemini 2.5 Flash</div>
                           <div className="bg-slate-800 px-2 py-1 rounded text-xs text-slate-300">JSON Schema Mode</div>
                        </div>
                    </div>
                  </div>

                  {/* Right Panel: Content Output */}
                  <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-6 min-h-[600px] flex flex-col shadow-inner">
                    <Tabs 
                      activeTab={activeTab} 
                      onTabChange={setActiveTab}
                      tabs={[
                        { id: 'stories', label: 'Stories' },
                        { id: 'tasks', label: 'Tasks' },
                        { id: 'code', label: 'Code' },
                        { id: 'pr', label: 'Pull Request' },
                        { id: 'build', label: 'Build Logs' },
                        { id: 'preview', label: 'Preview' },
                        ...(stage === WorkflowStage.DONE ? [{ id: 'done', label: 'Summary' }] : [])
                      ]} 
                    />
                    <div className="flex-1 animate-in fade-in duration-300 relative">
                      {renderContent()}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>

        {/* Dynamic Approval Gate - Sticky Bottom */}
        {isApprovalStage && (
            <div className="absolute bottom-6 left-0 right-0 max-w-4xl mx-auto px-4 z-50">
              <div className="bg-slate-900/95 backdrop-blur border border-blue-700/50 rounded-xl shadow-2xl shadow-black/80 overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
                
                {/* Gate Header */}
                <div className="bg-slate-800/50 px-6 py-3 flex items-center justify-between border-b border-slate-800/50">
                   <div className="flex items-center gap-2 text-blue-400 font-bold text-sm uppercase tracking-wider">
                      <UserCheck size={16} /> Approval Gate
                   </div>
                   <div className="text-xs text-slate-400">Human-in-the-Loop</div>
                </div>

                <div className="p-6">
                  {!isRequestingChanges ? (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                       <div className="flex items-start gap-4">
                          <div className="p-3 bg-green-900/20 rounded-full text-green-500 border border-green-900/30">
                             <CheckCircle size={24} />
                          </div>
                          <div>
                            <h3 className="font-bold text-slate-200 text-lg">{approvalCtx.title}</h3>
                            <p className="text-sm text-slate-400 mt-1">{approvalCtx.desc}</p>
                          </div>
                       </div>
                       
                       <div className="flex items-center gap-3 w-full md:w-auto">
                          <button 
                             onClick={handleDiscard}
                             className="px-4 py-2.5 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-lg font-medium text-sm transition-colors flex items-center gap-2 border border-transparent hover:border-red-900/30"
                          >
                             <XCircle size={16} /> Discard
                          </button>
                          <button 
                             onClick={() => setIsRequestingChanges(true)}
                             className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center gap-2 border border-slate-700"
                          >
                             <MessageSquare size={16} /> Request Changes
                          </button>
                          <button 
                            onClick={handleApprove}
                            className="px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-lg shadow-lg shadow-green-900/20 flex items-center gap-2 transition-all"
                          >
                             {approvalCtx.btn} <ArrowRight size={16} />
                          </button>
                       </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between">
                           <h3 className="font-bold text-slate-200">Describe required changes to {approvalCtx.title.toLowerCase()}</h3>
                           <button onClick={() => setIsRequestingChanges(false)} className="text-slate-500 hover:text-slate-300"><XCircle size={18}/></button>
                        </div>
                        <textarea 
                           className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none h-24"
                           placeholder="Describe what needs to be fixed..."
                           value={changeRequestFeedback}
                           onChange={(e) => setChangeRequestFeedback(e.target.value)}
                           autoFocus
                        />
                        <div className="flex justify-end gap-3">
                           <button onClick={() => setIsRequestingChanges(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
                           <button 
                              onClick={handleSubmitRework}
                              disabled={!changeRequestFeedback.trim()}
                              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                           >
                              <RotateCcw size={16} /> Submit & Rework
                           </button>
                        </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
        )}
      </div>
    </div>
  );
}