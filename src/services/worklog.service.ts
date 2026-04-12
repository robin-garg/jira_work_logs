import { getJiraConfigByType } from '../config/jira.config';
import { JiraService } from './jira.service';
import { formatWorklogDate } from '../utils/date.util';
import {
  CreateWorklogInput,
  CreateWorklogResult,
  JiraConfig,
  JiraInstanceType,
} from '../types/worklog.types';

type JiraConfigResolver = (type: JiraInstanceType) => JiraConfig;
type JiraServiceFactory = (config: JiraConfig) => JiraService;

export class WorklogService {
  constructor(
    private readonly resolveJiraConfig: JiraConfigResolver = getJiraConfigByType,
    private readonly createJiraService: JiraServiceFactory = (config) => new JiraService(config),
  ) {}

  async createWorklog(input: CreateWorklogInput): Promise<CreateWorklogResult> {
    const started = formatWorklogDate(input.date);
    const jiraConfig = this.resolveJiraConfig(input.type);
    const jiraService = this.createJiraService(jiraConfig);

    const jiraResult = await jiraService.addWorklog({
      issueId: input.issueId,
      message: input.message,
      timeSpent: input.timeSpent,
      started,
    });

    return {
      worklogId: jiraResult.worklogId,
      issueId: input.issueId,
      jiraType: input.type,
      started,
      timeSpentSeconds: jiraResult.timeSpentSeconds,
    };
  }
}
