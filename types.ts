
export interface Message {
  id: string;
  role: 'user' | 'model' | 'system' | 'function';
  text: string;
  timestamp: Date;
  isError?: boolean;
  functionCall?: {
    name: string;
    args: any;
  };
}

export interface Metric {
  label: string;
  value: string | number;
  change: number; // percentage
  trend: 'up' | 'down' | 'neutral';
  unit?: string;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
  source: string;
  message: string;
}

export interface DriveFile {
  name: string;
  path: string;
  lastModified: string;
  status: 'synced' | 'changed' | 'pending';
}

export interface Commit {
  hash: string;
  message: string;
  author: string;
  timestamp: string;
  branch: string;
  status: 'deployed' | 'pending' | 'failed';
}

export interface IntegrationConfig {
  githubRepo: string;
  githubBranch: string;
  drivePath: string;
  driveConnected: boolean;
  repoConnected: boolean;
  // Secrets
  railwayToken: string;
  driveFolderId: string;
  serviceAccountBase64: string;
}

export enum OrchestratorState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  EXECUTING = 'EXECUTING',
  AWAITING_DECISION = 'AWAITING_DECISION',
  SYNCING = 'SYNCING',
  WIRING = 'WIRING', // New state for agent actions
  STRESS_TEST = 'STRESS_TEST' // High load simulation
}
