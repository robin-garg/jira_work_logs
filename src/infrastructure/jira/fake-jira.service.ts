import { AddWorklogParams, AddWorklogResult, IJiraService } from '../../types/worklog.types';
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
}
