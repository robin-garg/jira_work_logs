export type JiraInstanceType = 'company' | 'client';

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

export interface AddWorklogParams {
  issueId: string;
  message: string;
  timeSpent: string;
  started: string;
}

export interface AddWorklogResult {
  worklogId?: string;
  timeSpentSeconds: number;
}

export interface IJiraService {
  addWorklog(params: AddWorklogParams): Promise<AddWorklogResult>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
