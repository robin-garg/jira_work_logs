import {
  CreateIssueInput,
  CreateIssueResult,
  IJiraService,
  JiraInstanceType,
} from '../types/worklog.types';

export class IssueService {
  constructor(
    private readonly jiraServiceFactory: (type: JiraInstanceType) => IJiraService,
  ) {}

  async createIssue(input: CreateIssueInput): Promise<CreateIssueResult> {
    const jiraService = this.jiraServiceFactory(input.type);

    const jiraResult = await jiraService.createIssue({
      projectKey: input.projectKey,
      summary: input.summary,
      issueType: input.issueType,
      description: input.description,
      labels: input.labels,
      priority: input.priority,
      assignToMe: input.assignToMe,
    });

    return {
      issueId: jiraResult.id,
      issueKey: jiraResult.key,
      jiraType: input.type,
      self: jiraResult.self,
      assignedToMe: jiraResult.assignedToMe,
    };
  }
}
