import {
  AddWorklogParams,
  AddWorklogResult,
  CreateIssueApiResult,
  CreateIssueParams,
  IJiraService,
} from '../../types/worklog.types';
import { parseTimeToSeconds } from '../../utils/time.util';

export class FakeJiraService implements IJiraService {
  async addWorklog(params: AddWorklogParams): Promise<AddWorklogResult> {
    console.warn('⚠️ Using Fake Jira Service');
    console.warn('Fake Jira addWorklog params:', params);

    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      worklogId: 'FAKE-123',
      timeSpentSeconds: parseTimeToSeconds(params.timeSpent),
    };
  }

  async createIssue(params: CreateIssueParams): Promise<CreateIssueApiResult> {
    console.warn('⚠️ Using Fake Jira Service');
    console.warn('Fake Jira createIssue params:', params);

    await new Promise((resolve) => setTimeout(resolve, 300));

    const key = `${params.projectKey}-999`;

    return {
      id: 'FAKE-ISSUE-001',
      key,
      self: `https://fake-jira.example.com/rest/api/3/issue/${key}`,
      assignedToMe: Boolean(params.assignToMe),
    };
  }
}
