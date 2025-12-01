export enum AgentRole {
  PRODUCT_OWNER = 'PRODUCT_OWNER',
  ARCHITECT = 'ARCHITECT',
  DEVELOPER = 'DEVELOPER',
  REVIEWER = 'REVIEWER',
  DEVOPS = 'DEVOPS'
}

export enum WorkflowStage {
  IDLE = 'IDLE',
  REQUIREMENTS = 'REQUIREMENTS',
  PLANNING = 'PLANNING',
  CODING = 'CODING',
  REVIEW = 'REVIEW',
  CHECKS = 'CHECKS',
  AWAITING_APPROVAL = 'AWAITING_APPROVAL',
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
  key: string; // e.g. DEV-101
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