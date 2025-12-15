export enum AgentRole {
  BMAD_ORCHESTRATOR = 'BMAD_ORCHESTRATOR', // Manager
  COPILOT_WORKSPACE = 'COPILOT_WORKSPACE', // PM / Architect
  COPILOT_CORE = 'COPILOT_CORE',           // Developer
  COPILOT_SECURITY = 'COPILOT_SECURITY',   // Reviewer / CodeQL
  GITHUB_ACTIONS = 'GITHUB_ACTIONS'        // DevOps / Runner
}

export enum WorkflowStage {
  IDLE = 'IDLE',
  ONBOARDING = 'ONBOARDING', // New stage for repository onboarding
  REQUIREMENTS = 'REQUIREMENTS',
  APPROVE_REQUIREMENTS = 'APPROVE_REQUIREMENTS',
  PLANNING = 'PLANNING',
  APPROVE_PLANNING = 'APPROVE_PLANNING',
  CODING = 'CODING',
  REVIEW = 'REVIEW',
  APPROVE_CODE = 'APPROVE_CODE',
  CHECKS = 'CHECKS',
  APPROVE_PREVIEW = 'APPROVE_PREVIEW',
  DEPLOYING = 'DEPLOYING',
  DONE = 'DONE'
}

export interface UserStory {
  id: string;
  title: string;
  description: string;
  acceptanceCriteria: string[];
}

export interface DevTask {
  id: string;
  key: string;
  title: string;
  description: string;
  assignee: AgentRole;
  status: 'TODO' | 'IN_PROGRESS' | 'CODE_REVIEW' | 'DONE';
  linkedStoryId: string;
}

export interface CodeFile {
  path: string;
  content: string;
  language: string;
}

export interface AgentLog {
  id: string;
  timestamp: number;
  role: AgentRole;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface CodeReviewComment {
  file: string;
  line?: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  comment: string;
  suggestion?: string;
}

export interface Repository {
  id: string;
  name: string;
  description: string;
  language: string;
  stars: number;
  openPrs: number;
  branch: string;
  source: 'github' | 'google-studio';
  complianceStatus: 'compliant' | 'pending' | 'missing'; // New field
}

export interface PullRequest {
  id: string;
  title: string;
  fromBranch: string;
  toBranch: string;
  description: string;
  status: 'OPEN' | 'MERGED' | 'CLOSED';
  filesChanged: number;
  checks: {
    name: string;
    status: 'PASS' | 'FAIL' | 'RUNNING' | 'PENDING';
  }[];
}