import { JiraService } from './jira.service';
import { formatWorklogDate } from '../utils/date.util';
import { CreateWorklogInput, CreateWorklogResult } from '../types/worklog.types';

export class WorklogValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorklogValidationError';
  }
}

export class WorklogService {
  async createWorklog(
    input: CreateWorklogInput,
    jiraService: JiraService,
  ): Promise<CreateWorklogResult> {
    let started: string;

    try {
      started = formatWorklogDate(input.date);
    } catch (error) {
      throw new WorklogValidationError((error as Error).message);
    }

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
