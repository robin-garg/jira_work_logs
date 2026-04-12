export type JiraInstanceType = 'personal' | 'client';

export interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
}

export interface CreateWorklogInput {
  type: JiraInstanceType;
  issueId: string;
  message: string;
  timeSpent: string;
  date?: string;
}

export interface CreateWorklogResult {
  worklogId?: string;
  issueId: string;
  jiraType: JiraInstanceType;
  started: string;
  timeSpentSeconds: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
