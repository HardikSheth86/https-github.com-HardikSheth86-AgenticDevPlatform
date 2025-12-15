import React, { useState, useCallback, useMemo } from 'react';
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
import { agentService } from './services/geminiService';
import { COMPLIANCE_FILES } from './data/complianceTemplates';
import AgentCard from './components/AgentCard';
import LogTerminal from './components/LogTerminal';
import WorkflowSteps from './components/WorkflowSteps';
import Tabs from './components/Tabs';
import Sidebar from './components/Sidebar';
import SettingsModal from './components/SettingsModal';
import AddRepoModal from './components/AddRepoModal';
import DashboardStats from './components/DashboardStats';
import CopilotChat from './components/CopilotChat';
import { Send, FileText, Code, Brain, GitPullRequest, Terminal, CheckCircle, CheckCircle2, Sparkles, UserCheck, ExternalLink, ArrowRight, XCircle, RotateCcw, MessageSquare, FolderPlus, Rocket, Command, ShieldAlert, Github, Percent, AlertTriangle, FileJson, FileLock, BookOpen, ScrollText, AlertOctagon, X, ThumbsDown, ThumbsUp, Wrench, ShieldCheck, RefreshCw } from 'lucide-react';

// Mock Data
const INITIAL_REPOS: Repository[] = [
  { id: '5', name: 'Sapphire', description: 'Enterprise AI Agent (Copilot Workspace)', language: 'Python', stars: 12, openPrs: 2, branch: 'main', source: 'google-studio', complianceStatus: 'compliant' },
  { id: '1', name: 'e-commerce-platform', description: 'Next.js storefront with Stripe integration', language: 'TypeScript', stars: 124, openPrs: 3, branch: 'main', source: 'github', complianceStatus: 'pending' },
  { id: '2', name: 'data-pipeline-worker', description: 'Python ETL service for analytics', language: 'Python', stars: 45, openPrs: 0, branch: 'develop', source: 'github', complianceStatus: 'missing' },
  { id: '3', name: 'auth-service', description: 'Go microservice for authentication', language: 'Go', stars: 89, openPrs: 1, branch: 'master', source: 'github', complianceStatus: 'compliant' },
  { id: '4', name: 'mobile-app-react-native', description: 'Cross-platform customer loyalty app', language: 'TypeScript', stars: 210, openPrs: 5, branch: 'main', source: 'github', complianceStatus: 'pending' }
];

export default function App() {
  // --- State ---
  const [repos, setRepos] = useState<Repository[]>(INITIAL_REPOS);
  const [currentView, setCurrentView] = useState<'workspace' | 'chat'>('workspace');
  const [input, setInput] = useState('');
  const [selectedRepoId, setSelectedRepoId] = useState<string | null>('5'); 
  const [stage, setStage] = useState<WorkflowStage>(WorkflowStage.IDLE);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddRepoOpen, setIsAddRepoOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Artifacts
  const [stories, setStories] = useState<UserStory[]>([]);
  const [tasks, setTasks] = useState<DevTask[]>([]);
  const [codeFiles, setCodeFiles] = useState<CodeFile[]>([]);
  const [docFiles, setDocFiles] = useState<CodeFile[]>([]); // New state for Docs
  const [reviews, setReviews] = useState<CodeReviewComment[]>([]);
  const [prDetails, setPrDetails] = useState<PullRequest | null>(null);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [featureBranch, setFeatureBranch] = useState<string>('');
  const [summary, setSummary] = useState<string[]>([]);
  const [testCoverage, setTestCoverage] = useState<number>(0);
  
  // Approval / Rework State
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);
  const [changeRequestFeedback, setChangeRequestFeedback] = useState('');
  const [appliedRequirementsFeedback, setAppliedRequirementsFeedback] = useState<string>('');

  // Logs
  const [logs, setLogs] = useState<AgentLog[]>([]);
  
  // UI
  const [activeTab, setActiveTab] = useState('stories');

  // Derived State
  const selectedRepo = selectedRepoId ? repos.find(r => r.id === selectedRepoId) : null;

  // --- Dynamic Preview Generation ---
  const previewUrl = useMemo(() => {
    if (codeFiles.length === 0) return null;
    
    // 1. Try to find a generated index.html
    const indexFile = codeFiles.find(f => 
        f.path.toLowerCase() === 'index.html' || 
        f.path.toLowerCase() === 'index.htm' ||
        f.path.toLowerCase() === 'public/index.html'
    );
    
    let content = "";
    if (indexFile) {
        content = indexFile.content;
    } else {
        // 2. Fallback: Generate a status page listing the artifacts
        content = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Preview - ${input}</title>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #e2e8f0; padding: 40px; line-height: 1.5; }
                .container { max-width: 800px; margin: 0 auto; }
                h1 { color: #38bdf8; margin-bottom: 0.5rem; display: flex; align-items: center; gap: 10px; }
                .badge { background: #22c55e; color: #000; font-size: 0.75rem; padding: 2px 8px; border-radius: 999px; font-weight: bold; vertical-align: middle; }
                .card { background: #1e293b; border: 1px solid #334155; padding: 24px; border-radius: 12px; margin-top: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                .file-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px; margin-top: 16px; }
                .file-item { background: #0f172a; padding: 12px; border-radius: 8px; border: 1px solid #334155; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 0.9rem; color: #94a3b8; display: flex; align-items: center; gap: 8px; }
                .icon { width: 16px; height: 16px; border-radius: 50%; background: #3b82f6; }
                a { color: #38bdf8; text-decoration: none; }
                a:hover { text-decoration: underline; }
              </style>
            </head>
            <body>
              <div class="container">
                <h1>Deployment Successful <span class="badge">LIVE</span></h1>
                <p>Your application has been successfully built and deployed to this preview environment.</p>
                
                <div class="card">
                   <h3 style="margin-top:0; color: #fff;">Deployment Details</h3>
                   <p><strong>Project:</strong> ${selectedRepo?.name || 'New Project'}</p>
                   <p><strong>Feature Branch:</strong> ${featureBranch}</p>
                   <p><strong>Status:</strong> Ready for QA</p>
                </div>
                
                <h3 style="margin-top: 32px; color: #94a3b8; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.05em;">Generated Artifacts</h3>
                <div class="file-list">
                  ${codeFiles.map(f => `
                    <div class="file-item">
                       <div class="icon" style="background: ${f.path.endsWith('json') ? '#f59e0b' : f.path.endsWith('ts') || f.path.endsWith('tsx') ? '#3b82f6' : '#64748b'}"></div>
                       ${f.path}
                    </div>
                  `).join('')}
                </div>
              </div>
            </body>
          </html>
        `;
    }
    
    const blob = new Blob([content], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }, [codeFiles, input, selectedRepo, featureBranch]);

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
        return AgentRole.COPILOT_WORKSPACE;
      
      case WorkflowStage.PLANNING: 
      case WorkflowStage.APPROVE_PLANNING:
        return AgentRole.BMAD_ORCHESTRATOR;
      
      case WorkflowStage.ONBOARDING:
        return AgentRole.BMAD_ORCHESTRATOR;

      case WorkflowStage.CODING: return AgentRole.COPILOT_CORE;
      case WorkflowStage.REVIEW: return AgentRole.COPILOT_SECURITY;
      case WorkflowStage.APPROVE_CODE: return AgentRole.COPILOT_SECURITY;
      
      case WorkflowStage.CHECKS: 
      case WorkflowStage.APPROVE_PREVIEW:
        return AgentRole.GITHUB_ACTIONS;
      
      case WorkflowStage.DEPLOYING: return AgentRole.GITHUB_ACTIONS;
      default: return null;
    }
  };

  const getRevertTargetLabel = () => {
    if (stage === WorkflowStage.PLANNING || stage === WorkflowStage.APPROVE_PLANNING) return "Requirements Approval";
    if (stage === WorkflowStage.CODING || stage === WorkflowStage.REVIEW || stage === WorkflowStage.APPROVE_CODE) return "Plan Approval";
    if (stage === WorkflowStage.CHECKS || stage === WorkflowStage.APPROVE_PREVIEW) return "Code Approval";
    if (stage === WorkflowStage.DEPLOYING) return "Preview Approval";
    if (stage === WorkflowStage.APPROVE_REQUIREMENTS) return "Start";
    if (stage === WorkflowStage.ONBOARDING) return "Repo Selection";
    return "Safe State";
  };

  // --- Workflow Orchestration ---

  const startWorkflow = async () => {
    if (!input.trim()) return;
    if (!process.env.API_KEY) {
        alert("API Key missing in environment.");
        return;
    }

    resetWorkflow();
    setStage(WorkflowStage.REQUIREMENTS);
    await runRequirements();
  };

  const resetWorkflow = () => {
    setLogs([]);
    setStories([]);
    setTasks([]);
    setCodeFiles([]);
    setDocFiles([]);
    setReviews([]);
    setPrDetails(null);
    setBuildLogs([]);
    setTestCoverage(0);
    setActiveTab('stories');
    setFeatureBranch('');
    setSummary([]);
    setIsRequestingChanges(false);
    setChangeRequestFeedback('');
    setAppliedRequirementsFeedback('');
    setHasError(false);
  };

  // NEW: Onboarding Workflow
  const runOnboarding = async () => {
    if (!selectedRepo || !process.env.API_KEY) return;
    
    resetWorkflow();
    setStage(WorkflowStage.ONBOARDING);
    setActiveTab('code');

    try {
        addLog(AgentRole.BMAD_ORCHESTRATOR, `Initializing Onboarding for ${selectedRepo.name}...`);
        await new Promise(r => setTimeout(r, 600));

        addLog(AgentRole.BMAD_ORCHESTRATOR, "Scanning repository structure...");
        await new Promise(r => setTimeout(r, 600));

        addLog(AgentRole.COPILOT_SECURITY, "Checking compliance status: MISSING CONFIG", 'warning');
        addLog(AgentRole.COPILOT_CORE, "Analyzing existing source code for test coverage...");
        await new Promise(r => setTimeout(r, 800));

        addLog(AgentRole.COPILOT_WORKSPACE, "Generating compliance artifacts (bmad.config, CI/CD, Policy)...");
        
        // Call Service
        const artifacts = await agentService.generateOnboardingArtifacts(selectedRepo);
        setCodeFiles(artifacts);
        
        addLog(AgentRole.BMAD_ORCHESTRATOR, `Generated ${artifacts.length} compliance and test files.`, 'success');
        
        // Create a dummy PR for this
        const branchName = `chore/onboard-${selectedRepo.name.toLowerCase().replace(/\s/g, '-')}`;
        setFeatureBranch(branchName);

        // Simulate Test Coverage Calculation on the "New" tests
        const coverage = 94; // Success for onboarding
        setTestCoverage(coverage);
        addLog(AgentRole.COPILOT_CORE, `Running new test suite... Coverage achieved: ${coverage}%`, 'success');

        // Move to Review
        setStage(WorkflowStage.APPROVE_CODE);
        setActiveTab('pr');
        
        // Generate Reviews
        const reviews = await agentService.reviewCode(artifacts);
        setReviews(reviews);

    } catch (e: any) {
        addLog(AgentRole.BMAD_ORCHESTRATOR, `Onboarding failed: ${e.message}`, 'error');
        setHasError(true);
    }
  };

  // PHASE 1: Requirements (Copilot Workspace)
  const runRequirements = async () => {
    setStage(WorkflowStage.REQUIREMENTS);
    setActiveTab('stories');
    setHasError(false);
    try {
      if (changeRequestFeedback) {
          addLog(AgentRole.BMAD_ORCHESTRATOR, `Refining user stories based on feedback: "${changeRequestFeedback}"`);
          setAppliedRequirementsFeedback(changeRequestFeedback);
      } else {
          addLog(AgentRole.BMAD_ORCHESTRATOR, `Initializing BMAD framework for: "${input}"`);
      }
      
      await new Promise(r => setTimeout(r, 500));
      addLog(AgentRole.COPILOT_WORKSPACE, `Analyzing repository context and user request...`);
      
      // Update: Pass feedback as a separate argument for robust refinement
      const generatedStories = await agentService.generateUserStories(
        input, 
        selectedRepo || undefined, 
        changeRequestFeedback || undefined,
        changeRequestFeedback ? stories : undefined
      );
      
      setStories(generatedStories);
      addLog(AgentRole.COPILOT_WORKSPACE, `Drafted ${generatedStories.length} user stories.`, 'success');
      
      // Clear feedback after consumption
      setChangeRequestFeedback('');
      setStage(WorkflowStage.APPROVE_REQUIREMENTS);
    } catch (e: any) {
      addLog(AgentRole.COPILOT_WORKSPACE, `Workspace error: ${e.message}`, 'error');
      setStage(WorkflowStage.IDLE);
    }
  };

  // PHASE 2: Planning (BMAD Orchestrator)
  const runPlanning = async () => {
    setStage(WorkflowStage.PLANNING);
    setActiveTab('tasks');
    setHasError(false);
    try {
      addLog(AgentRole.BMAD_ORCHESTRATOR, "Mapping user stories to implementation tasks...");
      
      // Use feedback if present
      const generatedTasks = await agentService.generateDevTasks(stories, changeRequestFeedback || undefined);
      
      setTasks(generatedTasks);
      addLog(AgentRole.BMAD_ORCHESTRATOR, `Planned ${generatedTasks.length} technical tasks.`, 'success');
      
      const branchBase = generatedTasks[0]?.key.toLowerCase() || 'project';
      const branchName = `feature/${branchBase}-copilot-${Math.floor(Math.random() * 100)}`;
      setFeatureBranch(branchName);
      
      // Reset feedback after consumption
      setChangeRequestFeedback('');
      setStage(WorkflowStage.APPROVE_PLANNING);
    } catch (e: any) {
      addLog(AgentRole.BMAD_ORCHESTRATOR, `Planning failed: ${e.message}`, 'error');
      setHasError(true);
    }
  };

  // PHASE 3: Coding & Testing (Copilot Core)
  const runCoding = async (forcePass: boolean = false) => {
    setStage(WorkflowStage.CODING);
    setActiveTab('code');
    setHasError(false);
    try {
      addLog(AgentRole.COPILOT_CORE, `Checking out ${featureBranch}...`);
      
      for (const task of tasks) {
          setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'IN_PROGRESS' } : t));
          addLog(AgentRole.COPILOT_CORE, `Processing ${task.key}: ${task.title}...`);
          await new Promise(r => setTimeout(r, 400)); 
      }

      // Parallel execution: Code + Docs
      addLog(AgentRole.COPILOT_CORE, "Synthesizing code and compliance artifacts...");
      
      // Pass feedback to generation
      const codePromise = agentService.generateCode(tasks, input, selectedRepo || undefined, changeRequestFeedback || undefined);
      
      addLog(AgentRole.COPILOT_WORKSPACE, "Generating technical documentation and test plans...");
      const docsPromise = agentService.generateProjectDocs(stories, tasks);

      const [generatedFiles, generatedDocs] = await Promise.all([codePromise, docsPromise]);
      
      // Clear feedback after use
      setChangeRequestFeedback('');

      // MERGE COMPLIANCE FILES
      const allFiles = [...generatedFiles, ...COMPLIANCE_FILES];
      setCodeFiles(allFiles);
      setDocFiles(generatedDocs); // Store Docs

      setTasks(prev => prev.map(t => ({ ...t, status: 'CODE_REVIEW' })));
      addLog(AgentRole.COPILOT_CORE, `Generated ${generatedFiles.length} source files + ${COMPLIANCE_FILES.length} compliance docs.`, 'success');
      addLog(AgentRole.COPILOT_WORKSPACE, `Created ${generatedDocs.length} documentation files (Tech Spec, User Guide, Test Plan).`, 'success');

      // Unit Tests (Mock)
      addLog(AgentRole.COPILOT_CORE, "Writing and running unit tests...");
      await new Promise(r => setTimeout(r, 800));
      
      // Calculate Coverage - Variable success rate to demonstrate gates
      const shouldPass = forcePass || Math.random() > 0.3; // 70% chance of success naturally
      const minCoverage = shouldPass ? 90 : 65;
      const maxCoverage = shouldPass ? 99 : 89;
      const coverage = Math.floor(Math.random() * (maxCoverage - minCoverage + 1)) + minCoverage;
      setTestCoverage(coverage);

      if (coverage >= 90) {
        addLog(AgentRole.COPILOT_CORE, `Tests passed with ${coverage}% coverage (BMAD Requirement: 90%).`, 'success');
      } else {
        addLog(AgentRole.COPILOT_CORE, `Tests finished with ${coverage}% coverage. Does not meet 90% threshold.`, 'warning');
      }

      // Code Review (Copilot Security)
      setStage(WorkflowStage.REVIEW);
      setActiveTab('pr');
      addLog(AgentRole.COPILOT_SECURITY, "Starting CodeQL security audit...");
      const codeReviews = await agentService.reviewCode(allFiles);
      setReviews(codeReviews);
      
      if (codeReviews.length === 0 || codeReviews.every(r => r.severity === 'LOW')) {
          addLog(AgentRole.COPILOT_SECURITY, "Security checks passed.", 'success');
      } else {
          addLog(AgentRole.COPILOT_SECURITY, `Detected ${codeReviews.length} potential issues.`, 'warning');
      }
      
      setStage(WorkflowStage.APPROVE_CODE);
    } catch (e: any) {
      addLog(AgentRole.COPILOT_CORE, `Coding failed: ${e.message}`, 'error');
      setHasError(true);
    }
  };

  // PHASE 4: Build & Preview (GitHub Actions)
  const runChecks = async () => {
    setStage(WorkflowStage.CHECKS);
    setActiveTab('build');
    setChangeRequestFeedback('');
    setHasError(false);
    
    if (!prDetails) {
        setPrDetails({
            id: Math.floor(Math.random() * 1000).toString(),
            title: `Feature: ${input.substring(0, 40)}...`,
            fromBranch: featureBranch || 'feature/update',
            toBranch: selectedRepo?.branch || 'main',
            description: `Implements user stories: ${stories.map(s => s.id).join(', ')}`,
            status: 'OPEN',
            filesChanged: codeFiles.length + docFiles.length,
            checks: [
            { name: 'build/linux', status: 'PENDING' },
            { name: 'codeql/analyze', status: 'PENDING' },
            { name: 'bmad/compliance', status: 'PENDING' }
            ]
        });
    }

    try {
      addLog(AgentRole.GITHUB_ACTIONS, `Triggered workflow: .github/workflows/bmad-ci.yml`);
      const buildSteps = [
          "Starting job: compliance-check (ubuntu-latest)",
          "Checkout repository...",
          "Checking bmad.config.json...",
          "Run npm test --coverage...",
          `Coverage Report: ${testCoverage}% (Pass > 90%)`,
          "Run CodeQL Analysis...",
          "Deploying to Azure Static Web Apps (Preview)..."
      ];

      for (const step of buildSteps) {
          addBuildLog(`[runner] ${step}`);
          await new Promise(r => setTimeout(r, 400));
      }

      addLog(AgentRole.GITHUB_ACTIONS, "Preview environment active.", 'success');
      
      setPrDetails(prev => prev ? ({
          ...prev,
          checks: [
              { name: 'build/linux', status: 'PASS' },
              { name: 'codeql/analyze', status: 'PASS' },
              { name: 'bmad/compliance', status: 'PASS' }
          ]
      }) : null);

      setActiveTab('preview');
      setStage(WorkflowStage.APPROVE_PREVIEW);
    } catch (e: any) {
      addLog(AgentRole.GITHUB_ACTIONS, `Workflow failed: ${e.message}`, 'error');
      setHasError(true);
    }
  };

  // PHASE 5: Deploy (GitHub Actions)
  const runDeployment = async () => {
    setStage(WorkflowStage.DEPLOYING);
    setChangeRequestFeedback('');
    setHasError(false);
    try {
      addLog(AgentRole.GITHUB_ACTIONS, `Merging Pull Request #${prDetails?.id}...`);
      await new Promise(r => setTimeout(r, 1000));
      
      setTasks(prev => prev.map(t => ({ ...t, status: 'DONE' })));
      setPrDetails(prev => prev ? ({ ...prev, status: 'MERGED' }) : null);
      
      addLog(AgentRole.GITHUB_ACTIONS, "PR Merged. Deleting feature branch.", 'success');
      addLog(AgentRole.GITHUB_ACTIONS, "Triggered workflow: .github/workflows/deploy-prod.yml", 'info');
      await new Promise(r => setTimeout(r, 1500));
      addLog(AgentRole.GITHUB_ACTIONS, "Deployment to Production complete.", 'success');
      
      const isOnboarding = tasks.length === 0 && stories.length === 0;

      setSummary(isOnboarding ? [
         `Repository Onboarded to BMAD Framework`,
         `Generated ${codeFiles.length} compliance files (Config, CI/CD, Security Policy)`,
         `Back-filled Unit Tests to achieve ${testCoverage}% Coverage`,
         `Merged PR #${prDetails?.id} to ${selectedRepo?.branch || 'main'}`,
      ] : [
         `Implemented ${stories.length} User Stories`,
         `Generated ${codeFiles.length} files (including BMAD compliance docs)`,
         `Generated ${docFiles.length} Project Documentation files`,
         `Unit Test Coverage: ${testCoverage}% (Pass)`,
         `Merged PR #${prDetails?.id} to ${selectedRepo?.branch || 'main'}`,
         `Deployed to Production`
      ]);
      
      setStage(WorkflowStage.DONE);
      setActiveTab('done');
    } catch (e: any) {
       addLog(AgentRole.GITHUB_ACTIONS, `Deploy failed: ${e.message}`, 'error');
       setHasError(true);
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
        if (testCoverage < 90) {
            addLog(AgentRole.BMAD_ORCHESTRATOR, "Coverage check failed. Instructing Copilot Core to improve tests...", 'warning');
            runCoding(true);
            return;
        }
        runChecks();
        break;
      case WorkflowStage.APPROVE_PREVIEW:
        runDeployment();
        break;
    }
  };

  const handleDiscard = () => {
     if(confirm("Discard workspace state and reset?")) {
        setStage(WorkflowStage.IDLE);
        setLogs([]);
     }
  };

  const handleRevert = () => {
    setHasError(false);
    setChangeRequestFeedback(''); // Ensure feedback state is cleared on revert
    
    // Determine previous stable stage based on current failed stage or current approval stage
    if (stage === WorkflowStage.PLANNING || stage === WorkflowStage.APPROVE_PLANNING) {
        setStage(WorkflowStage.APPROVE_REQUIREMENTS);
        setTasks([]); 
        setActiveTab('stories');
        addLog(AgentRole.BMAD_ORCHESTRATOR, "Reverted to Requirements Approval.", 'info');
    } else if (stage === WorkflowStage.CODING || stage === WorkflowStage.REVIEW || stage === WorkflowStage.APPROVE_CODE) {
        if (tasks.length === 0) {
            // Onboarding case
            setStage(WorkflowStage.IDLE);
            setCodeFiles([]);
            setLogs([]);
        } else {
            setStage(WorkflowStage.APPROVE_PLANNING);
            setCodeFiles([]); 
            setDocFiles([]);
            setReviews([]);
            setActiveTab('tasks');
            addLog(AgentRole.BMAD_ORCHESTRATOR, "Reverted to Plan Approval.", 'info');
        }
    } else if (stage === WorkflowStage.CHECKS || stage === WorkflowStage.APPROVE_PREVIEW) {
        setStage(WorkflowStage.APPROVE_CODE);
        setPrDetails(null);
        setBuildLogs([]);
        setActiveTab('pr');
        addLog(AgentRole.BMAD_ORCHESTRATOR, "Reverted to Code Approval.", 'info');
    } else if (stage === WorkflowStage.DEPLOYING) {
        setStage(WorkflowStage.APPROVE_PREVIEW);
        setActiveTab('preview');
        addLog(AgentRole.BMAD_ORCHESTRATOR, "Reverted to Preview Approval.", 'info');
    } else if (stage === WorkflowStage.APPROVE_REQUIREMENTS) {
        setStage(WorkflowStage.IDLE);
        setStories([]);
        setAppliedRequirementsFeedback(''); // Clear applied feedback if reverting to start
        addLog(AgentRole.BMAD_ORCHESTRATOR, "Reverted to Idle.", 'info');
    } else {
        // Default fallback
        setStage(WorkflowStage.IDLE);
        setAppliedRequirementsFeedback('');
    }
  };

  const handleSubmitRework = () => {
     if (!changeRequestFeedback.trim()) return;
     
     addLog(AgentRole.BMAD_ORCHESTRATOR, `Rework requested: "${changeRequestFeedback}". Adjusting plan...`, 'warning');
     
     const currentStage = stage;
     setIsRequestingChanges(false);
     
     if (currentStage === WorkflowStage.APPROVE_REQUIREMENTS) {
        runRequirements();
     } else if (currentStage === WorkflowStage.APPROVE_PLANNING) {
        runPlanning();
     } else if (currentStage === WorkflowStage.APPROVE_CODE) {
        // If in onboarding, regenerate onboarding artifacts
        if (tasks.length === 0) {
            runOnboarding();
        } else {
            runCoding();
        }
     } else if (currentStage === WorkflowStage.APPROVE_PREVIEW) {
        if (tasks.length === 0) {
            runOnboarding();
        } else {
            runCoding();
        }
     }
  };

  const handleAddRepo = async (name: string, description: string, language: string) => {
      const newRepo: Repository = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          description,
          language,
          stars: 0,
          openPrs: 0,
          branch: 'main',
          source: 'github',
          complianceStatus: 'missing'
      };
      setRepos(prev => [newRepo, ...prev]);
      setSelectedRepoId(newRepo.id);
      
      // Reset workflow to trigger onboarding UI check
      resetWorkflow();
      setStage(WorkflowStage.IDLE);
  };

  // --- UI Helpers ---

  const getApprovalContext = () => {
    switch(stage) {
      case WorkflowStage.APPROVE_REQUIREMENTS:
        return { 
          title: "Review Requirements Scope", 
          desc: "Copilot has analyzed your request. Please review the generated User Stories to ensure they match your intent.",
          btn: "Approve & Plan",
          tab: "stories",
          variant: "default",
          stats: `${stories.length} User Stories`
        };
      case WorkflowStage.APPROVE_PLANNING:
        return { 
          title: "Review Implementation Plan", 
          desc: "BMAD has decomposed the stories into technical tasks. Verify the architectural approach.",
          btn: "Approve & Code",
          tab: "tasks",
          variant: "default",
          stats: `${tasks.length} Tasks`
        };
      case WorkflowStage.APPROVE_CODE:
        const isCoverageFailure = testCoverage < 90;
        const isOnboarding = tasks.length === 0;
        return { 
          title: isCoverageFailure ? "Gate Failed: Low Coverage" : (isOnboarding ? "Review Onboarding Artifacts" : "Review Implementation"), 
          desc: isCoverageFailure 
             ? `Test coverage (${testCoverage}%) is below the strict 90% threshold. Deployment blocked.`
             : (isOnboarding 
                ? "Compliance configuration and test files have been generated. Review the PR to complete onboarding." 
                : "Code generated and tests passed. Review the Pull Request details and security scan results."),
          btn: isCoverageFailure ? "Fix Coverage" : "Approve & Run CI",
          tab: "pr",
          variant: isCoverageFailure ? "error" : "default",
          stats: `${codeFiles.length} Files, ${testCoverage}% Coverage`
        };
      case WorkflowStage.APPROVE_PREVIEW:
        return { 
          title: "Authorize Deployment", 
          desc: "Staging environment is live. Perform final validation before promoting to production.",
          btn: "Merge & Deploy",
          tab: "preview",
          variant: "default",
          stats: "Staging Live"
        };
      default:
        return null;
    }
  };

  const getFeedbackPlaceholder = (s: WorkflowStage) => {
    switch(s) {
      case WorkflowStage.APPROVE_REQUIREMENTS:
        return "Suggest specific refinements for the user stories (e.g., 'Add a story for login', 'Clarify acceptance criteria for search')...";
      case WorkflowStage.APPROVE_PLANNING:
        return "Suggest changes to the development tasks (e.g., 'Break down TASK-101', 'Assign database tasks to separate migration file')...";
      case WorkflowStage.APPROVE_CODE:
        return "Provide feedback on the code implementation (e.g., 'Refactor auth logic', 'Fix the edge case in payment validation')...";
      case WorkflowStage.APPROVE_PREVIEW:
        return "Report issues found in the preview environment...";
      default:
        return "Describe what needs to be changed...";
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
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 pb-32">
            {appliedRequirementsFeedback && (
              <div className="md:col-span-2 bg-blue-900/10 border border-blue-900/50 p-3 rounded-md mb-2 text-sm text-blue-300 flex items-start gap-2">
                 <MessageSquare size={16} className="mt-0.5 shrink-0" />
                 <div>
                    <span className="font-bold">Stories Refined based on feedback:</span> "{appliedRequirementsFeedback}"
                 </div>
              </div>
            )}
            {stories.length === 0 && <div className="text-slate-500 p-4 italic">Waiting for Copilot Workspace...</div>}
            {stories.map(story => (
              <div key={story.id} className="bg-[#0d1117] border border-slate-700 p-4 rounded-md shadow-sm hover:border-blue-500/50 transition-colors group">
                <div className="flex justify-between items-start mb-2">
                   <h4 className="font-semibold text-slate-100 group-hover:text-blue-400">{story.title}</h4>
                   <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">{story.id}</span>
                </div>
                <p className="text-sm text-slate-400 mb-4">{story.description}</p>
                <div className="bg-[#161b22] p-3 rounded text-xs text-slate-300 border border-slate-800">
                  <strong className="text-slate-500 uppercase tracking-wider text-[10px]">Acceptance Criteria</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-slate-400">
                    {story.acceptanceCriteria.map((ac, i) => <li key={i}>{ac}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        );
      case 'tasks':
        return (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-3 pb-32">
             {tasks.length === 0 && <div className="text-slate-500 p-4 italic">Waiting for BMAD Orchestrator...</div>}
             {['TODO', 'IN_PROGRESS', 'CODE_REVIEW', 'DONE'].map(status => {
                const statusTasks = tasks.filter(t => t.status === status);
                if(status === 'TODO' && statusTasks.length === 0 && tasks.length > 0) return null;
                
                return (
                   <div key={status} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">{status.replace('_', ' ')}</h3>
                        <span className="text-xs bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full">{statusTasks.length}</span>
                      </div>
                      {statusTasks.map(task => (
                        <div key={task.id} className="bg-[#0d1117] border border-slate-800 p-3 rounded-md shadow-sm hover:border-slate-600 transition-all">
                          <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-mono text-slate-500">{task.key}</span>
                            <div className="flex items-center gap-1 text-[10px] text-slate-500">
                               <div className="w-4 h-4 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400">C</div>
                            </div>
                          </div>
                          <p className="text-sm font-medium text-slate-200 leading-tight mt-1">{task.title}</p>
                        </div>
                      ))}
                   </div>
                )
             })}
          </div>
        );
      case 'code':
        return (
          <div className="space-y-4 pb-32">
             {testCoverage > 0 && (
              <div className="bg-[#161b22] border border-slate-700 rounded-lg p-4 flex items-center justify-between mb-4 animate-in fade-in slide-in-from-top-2 duration-500">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${testCoverage >= 90 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                    {testCoverage >= 90 ? <Percent size={24} /> : <AlertTriangle size={24} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Unit Test Coverage</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                             className={`h-full rounded-full transition-all duration-1000 ${testCoverage >= 90 ? 'bg-green-500' : 'bg-red-500'}`} 
                             style={{ width: `${testCoverage}%` }}
                          ></div>
                       </div>
                       <span className={`text-xs font-mono font-bold ${testCoverage >= 90 ? 'text-green-400' : 'text-red-400'}`}>
                          {testCoverage}%
                       </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">BMAD Threshold</div>
                   <div className="text-sm font-mono text-slate-300 font-bold">90% REQUIRED</div>
                </div>
              </div>
            )}
             {codeFiles.length === 0 && <div className="text-slate-500 p-4 italic">Waiting for Copilot Core...</div>}
             {codeFiles.map((file, idx) => {
               // Identify file type for icon
               const isCompliance = ['bmad.config.json', 'SECURITY.md', 'README.md'].includes(file.path) || file.path.startsWith('.github');
               const isTest = file.path.includes('.test.') || file.path.includes('spec');
               
               return (
               <div key={idx} className="bg-[#0d1117] border border-slate-700 rounded-md overflow-hidden group">
                 <div className="bg-[#161b22] px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-700 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      {isCompliance ? <FileLock size={14} className="text-orange-400" /> : 
                       isTest ? <CheckCircle size={14} className="text-green-400" /> :
                       <FileText size={14} className="text-blue-400" />}
                      <span className={isCompliance ? 'text-orange-200' : ''}>{file.path}</span>
                   </div>
                   <div className="flex items-center gap-3">
                      {isCompliance && <span className="px-2 py-0.5 bg-orange-900/30 text-orange-400 rounded text-[10px]">COMPLIANCE</span>}
                      <span className="text-[10px] text-slate-500">{file.language}</span>
                   </div>
                 </div>
                 <pre className="p-4 overflow-x-auto text-sm font-mono text-slate-300 leading-relaxed bg-[#0d1117]">
                   <code>{file.content}</code>
                 </pre>
               </div>
             )})}
          </div>
        );
      case 'docs':
        return (
          <div className="space-y-6 pb-32">
             {docFiles.length === 0 && <div className="text-slate-500 p-4 italic">Waiting for Documentation Generation...</div>}
             {docFiles.map((doc, idx) => (
                <div key={idx} className="bg-[#0d1117] border border-slate-700 rounded-lg overflow-hidden">
                   <div className="bg-[#161b22] px-4 py-3 border-b border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <BookOpen size={16} className="text-purple-400" />
                         <span className="text-sm font-bold text-slate-200">{doc.path}</span>
                      </div>
                      <span className="text-xs text-slate-500 uppercase tracking-wider">Markdown</span>
                   </div>
                   <div className="p-6 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                      {doc.content}
                   </div>
                </div>
             ))}
          </div>
        );
      case 'pr':
        if (!reviews.length && !prDetails && testCoverage === 0) return <div className="text-slate-500 p-4 italic">Waiting for Code...</div>;
        return (
          <div className="space-y-6 pb-32"> 
            {testCoverage > 0 && (
              <div className="bg-[#161b22] border border-slate-700 rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${testCoverage >= 90 ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                    {testCoverage >= 90 ? <Percent size={24} /> : <AlertTriangle size={24} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Unit Test Coverage</h3>
                    <div className="flex items-center gap-2 mt-1">
                       <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                             className={`h-full rounded-full transition-all duration-1000 ${testCoverage >= 90 ? 'bg-green-500' : 'bg-red-500'}`} 
                             style={{ width: `${testCoverage}%` }}
                          ></div>
                       </div>
                       <span className={`text-xs font-mono font-bold ${testCoverage >= 90 ? 'text-green-400' : 'text-red-400'}`}>
                          {testCoverage}%
                       </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                   <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider">BMAD Threshold</div>
                   <div className="text-sm font-mono text-slate-300 font-bold">90% REQUIRED</div>
                </div>
              </div>
            )}

            <div className="bg-[#0d1117] rounded-md border border-slate-700 overflow-hidden">
              {prDetails && (
              <div className="p-6 border-b border-slate-700 bg-[#161b22]">
                <div className="flex items-center gap-3 mb-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium border ${
                      prDetails.status === 'OPEN' ? 'bg-green-900/20 text-green-400 border-green-900/50' : 'bg-purple-900/20 text-purple-400 border-purple-900/50'
                    }`}>
                      <GitPullRequest size={16} className="inline mr-2" /> 
                      {prDetails.status}
                    </div>
                    <h2 className="text-xl font-semibold text-white">
                      {prDetails.title} <span className="text-slate-500 font-light">#{prDetails.id}</span>
                    </h2>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400 font-mono">
                    <span className="bg-[#0d1117] px-2 py-0.5 rounded text-blue-400">{prDetails.fromBranch}</span>
                    <span>→</span>
                    <span className="bg-[#0d1117] px-2 py-0.5 rounded text-slate-300">{prDetails.toBranch}</span>
                </div>
              </div>
              )}

              <div className="flex flex-col lg:flex-row">
                <div className="flex-1 p-6 space-y-6 bg-[#0d1117]">
                    {prDetails && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2"><CheckCircle2 size={16}/> CI/CD Checks</h3>
                      <div className="space-y-2">
                        {prDetails.checks.map((check, i) => (
                            <div key={i} className="flex items-center justify-between bg-[#161b22] p-2 rounded border border-slate-800">
                              <span className="flex items-center gap-3 text-sm text-slate-300">
                                  {check.status === 'PASS' ? <CheckCircle2 size={16} className="text-green-500"/> : <div className="w-4 h-4 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin"/>}
                                  {check.name}
                              </span>
                              <span className="text-xs text-slate-500 font-mono">{check.status}</span>
                            </div>
                        ))}
                      </div>
                    </div>
                    )}
                </div>

                {/* Reviews Sidebar */}
                <div className="w-full lg:w-96 bg-[#161b22] border-l border-slate-700 p-6 space-y-4">
                    <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                      <ShieldAlert size={16} className="text-orange-400" /> Copilot Security Scan
                    </h3>
                    {reviews.length === 0 && <p className="text-sm text-slate-500">No security issues detected.</p>}
                    {reviews.map((rev, idx) => (
                      <div key={idx} className={`p-3 rounded border text-sm ${
                        rev.severity === 'HIGH' ? 'border-red-900/50 bg-red-900/10' : 
                        'border-slate-700 bg-[#0d1117]'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-xs text-slate-500 truncate max-w-[150px]">{rev.file}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                              rev.severity === 'HIGH' ? 'bg-red-900 text-red-200' : 'bg-blue-900 text-blue-200'
                          }`}>{rev.severity}</span>
                        </div>
                        <p className="text-slate-300 mb-2 leading-relaxed">{rev.comment}</p>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 'build':
        return (
          <div className="bg-[#0d1117] rounded-md border border-slate-700 overflow-hidden font-mono text-sm shadow-xl pb-32">
             <div className="bg-[#161b22] p-3 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <Terminal size={14} className="text-slate-400" />
                   <span className="text-slate-300">Action: build-and-deploy</span>
                </div>
                {stage === WorkflowStage.CHECKS && (
                   <span className="flex items-center gap-2 text-yellow-500 text-xs animate-pulse">Running...</span>
                )}
             </div>
             <div className="p-4 h-[400px] overflow-y-auto space-y-1">
                {buildLogs.length === 0 && <div className="text-slate-600">Waiting for runner...</div>}
                {buildLogs.map((log, i) => (
                   <div key={i} className="text-slate-300 break-all flex gap-3">
                      <span className="text-slate-600 text-xs min-w-[50px]">{new Date().toLocaleTimeString().split(' ')[0]}</span>
                      <span>{log}</span>
                   </div>
                ))}
             </div>
          </div>
        );
      case 'preview':
        return (
          <div className="h-96 bg-[#0d1117] rounded-md border border-slate-700 flex items-center justify-center text-slate-200 relative overflow-hidden pb-32">
             {(stage === WorkflowStage.APPROVE_PREVIEW || stage === WorkflowStage.DONE || stage === WorkflowStage.DEPLOYING) ? (
               <div className="text-center animate-in zoom-in duration-300">
                 <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 text-white shadow-xl shadow-blue-500/20">
                   <ExternalLink size={40} />
                 </div>
                 <h3 className="text-2xl font-bold text-white mb-2">Deployed to Preview</h3>
                 <p className="text-slate-400 max-w-md mx-auto mb-6">
                    Environment: <span className="font-mono text-blue-400">{featureBranch}</span>
                 </p>
                 <div 
                   onClick={() => previewUrl && window.open(previewUrl, '_blank')}
                   className="bg-[#161b22] rounded-md border border-slate-700 p-4 flex items-center gap-3 max-w-sm mx-auto cursor-pointer hover:border-blue-500 transition-colors group"
                 >
                    <div className="w-2 h-2 bg-green-500 rounded-full group-hover:animate-pulse"></div>
                    <span className="text-blue-400 font-mono text-sm truncate underline flex-1">
                      {selectedRepo?.name ? `https://${selectedRepo.name}.preview.web` : 'Open Live Preview'}
                    </span>
                    <ExternalLink size={14} className="text-blue-500" />
                 </div>
               </div>
             ) : (
               <div className="flex flex-col items-center text-slate-600">
                  <Rocket size={48} className="mb-4 opacity-20" />
                  <p>Deployment in progress...</p>
               </div>
             )}
          </div>
        );
      case 'done':
          return (
             <div className="p-8 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500 ring-2 ring-green-500/20">
                   <Sparkles size={40} />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Workflow Completed</h2>
                <p className="text-slate-400 mb-8">The BMAD framework has successfully delivered the changes.</p>
                
                <div className="max-w-xl mx-auto bg-[#0d1117] border border-slate-700 rounded-lg overflow-hidden text-left mb-8">
                   <div className="bg-[#161b22] px-4 py-3 border-b border-slate-700 font-semibold text-slate-200 text-sm">
                      Summary of Changes
                   </div>
                   <div className="p-4 space-y-3">
                      {summary.map((item, i) => (
                         <div key={i} className="flex items-center gap-3 text-slate-400 text-sm">
                            <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                            <span>{item}</span>
                         </div>
                      ))}
                   </div>
                </div>

                <button 
                  onClick={() => setStage(WorkflowStage.IDLE)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-medium transition-colors inline-flex items-center gap-2"
                >
                   <Command size={16} /> New Task
                </button>
             </div>
          );
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#010409] text-slate-200 selection:bg-blue-500/30 font-sans">
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <AddRepoModal 
        isOpen={isAddRepoOpen} 
        onClose={() => setIsAddRepoOpen(false)} 
        onAdd={handleAddRepo} 
      />
      
      <Sidebar 
        repos={repos} 
        selectedRepoId={selectedRepoId} 
        onSelectRepo={(id) => {
           if (stage === WorkflowStage.IDLE || stage === WorkflowStage.DONE) {
             setSelectedRepoId(id);
             // When switching repos, reset workflow to allow clean start
             resetWorkflow();
             setStage(WorkflowStage.IDLE);
           }
        }} 
        onSettingsClick={() => setIsSettingsOpen(true)}
        currentView={currentView}
        onViewChange={setCurrentView}
        onAddRepoClick={() => setIsAddRepoOpen(true)}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {currentView === 'chat' ? (
          <CopilotChat />
        ) : (
        <>
        {/* Top Bar */}
        <header className="h-16 border-b border-slate-800 bg-[#0d1117] flex items-center justify-between px-6 flex-shrink-0">
          <div>
            <h2 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
              {selectedRepo ? (
                <>
                  <span className="text-slate-500 font-normal">
                     {selectedRepo.source === 'google-studio' ? 'Copilot Studio' : 'Github'} /
                  </span> 
                  {selectedRepo.name}
                </>
              ) : (
                <span className="text-slate-500">New Project Specification</span>
              )}
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs">
             {testCoverage > 0 && (
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-all animate-in fade-in duration-500 ${
                    testCoverage >= 90 
                    ? 'bg-green-900/20 border-green-900/50 text-green-400' 
                    : 'bg-red-900/20 border-red-900/50 text-red-400'
                }`}>
                   <Percent size={12} />
                   <span className="font-bold">{testCoverage}% Coverage</span>
                </div>
             )}
             {selectedRepo && (
                <div className="flex items-center gap-2 px-3 py-1 bg-[#161b22] rounded-full border border-slate-800 text-slate-400">
                  <GitPullRequest size={12} />
                  <span>{selectedRepo.openPrs} PRs</span>
                </div>
             )}
            <div className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${stage === WorkflowStage.IDLE || stage === WorkflowStage.DONE ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
               <span className="text-slate-400">{stage === WorkflowStage.IDLE ? 'System Ready' : 'Agents Active'}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <div className="max-w-6xl mx-auto space-y-8">
            
            {/* Input Section */}
            <section className="max-w-3xl mx-auto">
              {stage === WorkflowStage.IDLE && (
                 <>
                 {/* Compliance Alert - Only show if pending or missing */}
                 {selectedRepo && selectedRepo.complianceStatus !== 'compliant' ? (
                   <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-8 text-center shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500"></div>
                      <div className="w-20 h-20 bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-orange-500 border border-orange-500/30 shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                         <ShieldCheck size={40} />
                      </div>
                      <h1 className="text-2xl font-bold text-white mb-2">Repository Not Compliant</h1>
                      <p className="text-slate-400 max-w-lg mx-auto mb-8 leading-relaxed">
                        This repository is missing the required BMAD configuration files, security policies, or test coverage thresholds.
                      </p>
                      
                      <button 
                        onClick={runOnboarding}
                        className="px-8 py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-lg font-bold transition-all shadow-lg hover:shadow-orange-500/20 flex items-center gap-2 mx-auto"
                      >
                         <Wrench size={18} /> Initialize BMAD Onboarding
                      </button>
                      
                      <div className="mt-6 flex justify-center gap-6 text-xs text-slate-500 font-mono">
                         <span className="flex items-center gap-1"><X size={12} className="text-red-500"/> bmad.config.json</span>
                         <span className="flex items-center gap-1"><X size={12} className="text-red-500"/> CI/CD Workflow</span>
                         <span className="flex items-center gap-1"><X size={12} className="text-red-500"/> 90% Coverage</span>
                      </div>
                   </div>
                 ) : (
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center p-3 bg-white rounded-full mb-4 shadow-lg shadow-white/10">
                            <Github size={32} className="text-black"/>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            What can Copilot build for you?
                        </h1>
                        <p className="text-slate-400">
                            Powered by GitHub Copilot & BMAD Multi-Agent Framework
                        </p>
                    </div>
                 )}
                 </>
              )}
              
              {/* Standard Input - Hide if Onboarding Alert is active to focus user */}
              {stage === WorkflowStage.IDLE && (!selectedRepo || selectedRepo.complianceStatus === 'compliant') && (
                  <div className={`relative group transition-all duration-500 scale-100`}>
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative bg-[#0d1117] rounded-xl p-1 flex items-center shadow-2xl border border-slate-800">
                    <div className="pl-4 text-slate-500"><Command size={20}/></div>
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={selectedRepo ? "e.g., @copilot Refactor the auth middleware to use JWT..." : "e.g., Create a React app for tracking personal finance..."} 
                        className="w-full bg-transparent border-none px-4 py-4 text-lg focus:outline-none focus:ring-0 text-white placeholder-slate-600"
                        onKeyDown={(e) => e.key === 'Enter' && stage === WorkflowStage.IDLE && startWorkflow()}
                    />
                    <button 
                        onClick={() => startWorkflow()}
                        className="px-4 py-2 m-2 bg-white hover:bg-slate-200 text-black rounded-lg font-bold transition-all flex items-center gap-2"
                    >
                        <ArrowRight size={18} />
                    </button>
                    </div>
                  </div>
              )}

               {stage === WorkflowStage.IDLE && (
                 <div className="mt-12">
                   <DashboardStats />
                 </div>
               )}
            </section>

            {/* Agent Status Grid */}
            {stage !== WorkflowStage.IDLE && (
              <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <AgentCard role={AgentRole.COPILOT_WORKSPACE} isActive={activeRole === AgentRole.COPILOT_WORKSPACE} statusMessage="Analyzing constraints..." />
                <AgentCard role={AgentRole.BMAD_ORCHESTRATOR} isActive={activeRole === AgentRole.BMAD_ORCHESTRATOR} statusMessage="Orchestrating agents..." />
                <AgentCard role={AgentRole.COPILOT_CORE} isActive={activeRole === AgentRole.COPILOT_CORE} statusMessage="Synthesizing code..." />
                <AgentCard role={AgentRole.GITHUB_ACTIONS} isActive={activeRole === AgentRole.GITHUB_ACTIONS} statusMessage="Running workflows..." />
                <AgentCard role={AgentRole.COPILOT_SECURITY} isActive={activeRole === AgentRole.COPILOT_SECURITY} statusMessage="Scanning vulnerabilities..." />
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
                    <div className="bg-[#0d1117] border border-slate-800 rounded-lg p-4 text-sm text-slate-400 flex-1">
                        <h4 className="font-bold text-slate-200 mb-2 flex items-center gap-2"><Sparkles size={14} className="text-purple-400"/> Copilot Context</h4>
                        <p className="opacity-70 leading-relaxed text-xs">
                          {selectedRepo 
                            ? `Active context includes ${selectedRepo.name} codebase, open issues, and project roadmap.`
                            : "Bootstrapping new repository with standard GitHub Actions workflows and best practices."}
                        </p>
                    </div>
                  </div>

                  {/* Right Panel: Content Output */}
                  <div className="lg:col-span-2 bg-[#0d1117] border border-slate-800 rounded-xl p-0 min-h-[600px] flex flex-col shadow-inner overflow-hidden">
                    <div className="p-4 border-b border-slate-800">
                      <Tabs 
                        activeTab={activeTab} 
                        onTabChange={setActiveTab}
                        tabs={[
                          ...(stage !== WorkflowStage.ONBOARDING ? [{ id: 'stories', label: 'Spec' }, { id: 'tasks', label: 'Plan' }] : []),
                          { id: 'code', label: 'Code' },
                          ...(stage !== WorkflowStage.ONBOARDING ? [{ id: 'docs', label: 'Docs' }] : []),
                          { id: 'pr', label: 'Review' },
                          { id: 'build', label: 'CI/CD' },
                          { id: 'preview', label: 'Preview' },
                          ...(stage === WorkflowStage.DONE ? [{ id: 'done', label: 'Done' }] : [])
                        ]} 
                      />
                    </div>
                    <div className="flex-1 p-6 animate-in fade-in duration-300 relative bg-[#010409]">
                      {renderContent()}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        </main>
        </>
        )}

        {/* Dynamic Approval Gate - Floating Dock */}
        {isApprovalStage && currentView === 'workspace' && (
            <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-4xl z-50 animate-in slide-in-from-bottom-10 duration-500 px-4">
              <div className={`
                 bg-[#161b22]/95 backdrop-blur-md border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden 
                 transition-all duration-300
                 ${approvalCtx.variant === 'error' ? 'border-red-500/50 ring-1 ring-red-900/50' : 'border-slate-700 ring-1 ring-white/10'}
              `}>
                
                {/* Dock Header */}
                <div className={`px-6 py-4 flex items-center justify-between border-b ${approvalCtx.variant === 'error' ? 'bg-red-900/10 border-red-900/50' : 'bg-[#0d1117]/50 border-slate-800'}`}>
                   <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${approvalCtx.variant === 'error' ? 'bg-red-500/10 text-red-500' : 'bg-blue-500/10 text-blue-400'}`}>
                          {approvalCtx.variant === 'error' ? <AlertTriangle size={20} /> : <UserCheck size={20} />} 
                      </div>
                      <div>
                         <h3 className={`font-bold text-base leading-tight ${approvalCtx.variant === 'error' ? 'text-red-400' : 'text-slate-200'}`}>
                             {approvalCtx.title}
                         </h3>
                         <div className="text-xs text-slate-500 mt-0.5 font-mono flex items-center gap-2">
                             <Sparkles size={10} className="text-purple-400"/>
                             Awaiting Human Approval
                         </div>
                      </div>
                   </div>
                   {approvalCtx.stats && (
                      <div className="px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700/50 text-xs font-mono text-slate-300">
                          {approvalCtx.stats}
                      </div>
                   )}
                </div>

                <div className="p-6">
                  {!isRequestingChanges ? (
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                       <div className="flex-1">
                          <p className="text-sm text-slate-300 leading-relaxed max-w-xl">{approvalCtx.desc}</p>
                       </div>
                       
                       <div className="flex items-center gap-3 w-full md:w-auto">
                          <button 
                              onClick={handleRevert}
                              className="px-4 py-2 text-slate-400 hover:text-white rounded-lg font-medium text-xs transition-colors hover:bg-slate-800 flex items-center gap-2"
                              title="Rollback to previous stage"
                          >
                              <RotateCcw size={14} /> Revert
                          </button>

                          <button 
                             onClick={handleDiscard}
                             className="px-4 py-2 text-red-400 hover:bg-red-950/30 hover:text-red-300 rounded-lg font-medium text-xs transition-colors border border-transparent hover:border-red-900/30 flex items-center gap-2"
                          >
                             <ThumbsDown size={14} /> Reject & Exit
                          </button>
                          
                          {/* Standard Request Changes - available if not a hard failure */}
                          {approvalCtx.variant !== 'error' && (
                            <button 
                               onClick={() => setIsRequestingChanges(true)}
                               className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-slate-200 rounded-lg font-medium text-xs transition-colors border border-slate-700 flex items-center gap-2 shadow-sm"
                            >
                               <MessageSquare size={14} /> Request Changes
                            </button>
                          )}

                          <button 
                            onClick={handleApprove}
                            className={`px-6 py-2 font-bold rounded-lg shadow-lg flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 text-sm ${
                                approvalCtx.variant === 'error' 
                                ? 'bg-red-600 hover:bg-red-500 text-white' 
                                : 'bg-[#238636] hover:bg-[#2ea043] text-white ring-1 ring-white/10'
                            }`}
                          >
                             {approvalCtx.variant === 'error' ? <RotateCcw size={14} /> : <ThumbsUp size={14} />}
                             {approvalCtx.btn} 
                          </button>
                       </div>
                    </div>
                  ) : (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="flex items-center justify-between mb-2">
                           <div>
                              <h3 className="font-bold text-white flex items-center gap-2 text-sm">
                                 <MessageSquare size={16} className="text-blue-400"/> 
                                 Request Changes / Provide Feedback
                              </h3>
                              <p className="text-xs text-slate-500 mt-1">
                                 The agent will regenerate the artifacts based on your instructions.
                              </p>
                           </div>
                           <button onClick={() => setIsRequestingChanges(false)} className="text-slate-400 hover:text-white p-2 hover:bg-slate-800 rounded-full transition-colors">
                              <X size={16}/>
                           </button>
                        </div>
                        
                        <div className="relative group">
                           <textarea 
                              className="w-full bg-[#0d1117] border border-slate-700 rounded-xl p-4 text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none resize-none h-24 text-sm font-mono leading-relaxed transition-all"
                              placeholder={getFeedbackPlaceholder(stage)}
                              value={changeRequestFeedback}
                              onChange={(e) => setChangeRequestFeedback(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && e.ctrlKey) {
                                  handleSubmitRework();
                                }
                              }}
                              autoFocus
                           />
                           <div className="absolute bottom-3 right-3 text-[10px] text-slate-600 font-mono group-focus-within:text-blue-500/50">
                              CTRL + ENTER TO SUBMIT
                           </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                           <button 
                              onClick={() => setIsRequestingChanges(false)} 
                              className="px-4 py-2 text-slate-400 hover:text-white text-xs font-medium"
                           >
                              Cancel
                           </button>
                           <button 
                              onClick={handleSubmitRework}
                              disabled={!changeRequestFeedback.trim()}
                              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs transition-all"
                           >
                              <RotateCcw size={14} /> 
                              Submit Rework Request
                           </button>
                        </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
        )}

        {/* Error Gate / Revert UI */}
        {hasError && currentView === 'workspace' && (
             <div className="absolute top-24 right-8 w-full max-w-md z-50">
              <div className="bg-[#161b22]/95 backdrop-blur border border-red-900/50 rounded-lg shadow-2xl shadow-red-900/20 overflow-hidden animate-in slide-in-from-right-4 duration-300">
                <div className="px-6 py-2 flex items-center justify-between border-b bg-red-900/20 border-red-900/50">
                   <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-red-400">
                      <AlertOctagon size={14} /> System Failure
                   </div>
                   <div className="text-[10px] text-red-400/70">Unexpected Error</div>
                </div>

                <div className="p-6">
                   <div className="flex items-start gap-4 mb-6">
                      <div className="p-3 rounded-full border bg-red-900/20 text-red-500 border-red-900/50">
                         <AlertTriangle size={24} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-red-400">Workflow Stalled</h3>
                        <p className="text-sm text-slate-400 mt-1">An unexpected error occurred during the <span className="text-white font-mono">{stage}</span> phase. The agents cannot proceed.</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center justify-end gap-3 w-full">
                      <button 
                         onClick={handleDiscard}
                         className="px-4 py-2 text-slate-400 hover:bg-slate-800 hover:text-white rounded-md font-medium text-sm transition-colors"
                      >
                         Abort Session
                      </button>

                      <button 
                        onClick={handleRevert}
                        className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-md shadow-md flex items-center gap-2 transition-all"
                      >
                         <RotateCcw size={16} /> Revert to {getRevertTargetLabel()}
                      </button>
                   </div>
                </div>
              </div>
            </div>
        )}
      </div>
    </div>
  );
}