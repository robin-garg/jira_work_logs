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

export interface CreateIssueInput {
  type: JiraInstanceType;
  projectKey: string;
  summary: string;
  issueType: string;
  description?: string;
  labels?: string[];
  priority?: string;
  /** When true, assign the issue to the authenticated Jira user. */
  assignToMe?: boolean;
}

export interface CreateIssueResult {
  issueId: string;
  issueKey: string;
  jiraType: JiraInstanceType;
  self?: string;
  assignedToMe?: boolean;
}

export interface CreateIssueParams {
  projectKey: string;
  summary: string;
  issueType: string;
  description?: string;
  labels?: string[];
  priority?: string;
  assignToMe?: boolean;
}

export interface CreateIssueApiResult {
  id: string;
  key: string;
  self?: string;
  assignedToMe?: boolean;
}

export interface IJiraService {
  addWorklog(params: AddWorklogParams): Promise<AddWorklogResult>;
  createIssue(params: CreateIssueParams): Promise<CreateIssueApiResult>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
