/**
 * Jira Service Module
 *
 * Provides methods to interact with Jira REST API.
 * Handles authentication, request formatting, and error handling.
 */

import axios, { AxiosError } from 'axios';
import {
  AddWorklogParams,
  AddWorklogResult,
  CreateIssueApiResult,
  CreateIssueParams,
  IJiraService,
  JiraConfig,
} from '../../types/worklog.types';
import { parseTimeToSeconds } from '../../utils/time.util';

interface JiraWorklogResponse {
  id?: string;
}

interface JiraCreateIssueResponse {
  id: string;
  key: string;
  self?: string;
}

interface JiraMyselfResponse {
  accountId: string;
}

/**
 * JiraService class
 *
 * Handles all Jira API interactions including worklog management.
 */
export class JiraService implements IJiraService {
  constructor(private readonly config: JiraConfig) {}

  /**
   * Builds the Basic Authentication header
   *
   * Jira Cloud API uses Basic Auth with email:apiToken encoded in Base64
   * Format: "Basic base64(email:apiToken)"
   *
   * @returns Authorization header value
   */
  private buildAuthHeader(): string {
    const credentials = `${this.config.email}:${this.config.apiToken}`;
    const base64Credentials = Buffer.from(credentials).toString('base64');
    return `Basic ${base64Credentials}`;
  }

  /**
   * Converts plain text to Atlassian Document Format (ADF)
   *
   * Jira API v3 requires comments to be in ADF format, not plain text.
   * This function converts a simple text string into the required ADF structure.
   *
   * @param text - Plain text message
   * @returns ADF formatted comment object
   */
  private convertToADF(text: string): object {
    return {
      version: 1,
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            {
              type: 'text',
              text,
            },
          ],
        },
      ],
    };
  }

  /**
   * Adds a worklog entry to a Jira issue
   *
   * @param issueId - The Jira issue ID (e.g., "PROJ-123")
   * @param message - The worklog comment/description
   * @param timeSpent - Time spent in Jira format (e.g., "2h 30m", "1d", "45m")
   * @param startedDate - When the work started (Jira format: YYYY-MM-DDTHH:mm:ss.SSS+0000)
   * @throws Error if the API request fails with a clean, readable message
   *
   * @example
   * await jiraService.addWorklog(
   *   'PROJ-123',
   *   'Fixed bug in authentication',
   *   '2h 30m',
   *   '2026-03-02T14:30:00.000+0000'
   * );
   */
  async addWorklog(params: AddWorklogParams): Promise<AddWorklogResult> {
    const url = `${this.config.baseUrl}/rest/api/3/issue/${params.issueId}/worklog`;
    const timeSpentSeconds = parseTimeToSeconds(params.timeSpent);

    const requestBody = {
      comment: this.convertToADF(params.message),
      started: params.started,
      timeSpentSeconds,
    };

    try {
      const response = await axios.post<JiraWorklogResponse>(url, requestBody, {
        headers: this.getRequestHeaders(),
      });

      return {
        worklogId: response.data?.id,
        timeSpentSeconds,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(this.buildJiraErrorMessage(error, `add worklog to issue ${params.issueId}`));
      }

      throw new Error(`Failed to add worklog to issue ${params.issueId}: ${(error as Error).message}`);
    }
  }

  /**
   * Creates a new Jira issue
   *
   * @param params - Project key, summary, issue type, and optional fields
   * @throws Error if the API request fails with a clean, readable message
   *
   * @example
   * await jiraService.createIssue({
   *   projectKey: 'PROJ',
   *   summary: 'Fix login redirect',
   *   issueType: 'Task',
   *   description: 'Users are redirected to the wrong page after login.',
   * });
   */
  private getRequestHeaders(): Record<string, string> {
    return {
      Authorization: this.buildAuthHeader(),
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
  }

  /**
   * Resolves the accountId of the authenticated Jira user.
   */
  private async getCurrentUserAccountId(): Promise<string> {
    const url = `${this.config.baseUrl}/rest/api/3/myself`;

    try {
      const response = await axios.get<JiraMyselfResponse>(url, {
        headers: this.getRequestHeaders(),
      });

      if (!response.data?.accountId) {
        throw new Error('Jira /myself response did not include an accountId.');
      }

      return response.data.accountId;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(this.buildJiraErrorMessage(error, 'resolve current Jira user'));
      }

      throw new Error(`Failed to resolve current Jira user: ${(error as Error).message}`);
    }
  }

  async createIssue(params: CreateIssueParams): Promise<CreateIssueApiResult> {
    const url = `${this.config.baseUrl}/rest/api/3/issue`;

    const fields: Record<string, unknown> = {
      project: { key: params.projectKey },
      summary: params.summary,
      issuetype: { name: params.issueType },
    };

    if (params.description) {
      fields.description = this.convertToADF(params.description);
    }

    if (params.labels && params.labels.length > 0) {
      fields.labels = params.labels;
    }

    if (params.priority) {
      fields.priority = { name: params.priority };
    }

    if (params.assignToMe) {
      const accountId = await this.getCurrentUserAccountId();
      fields.assignee = { accountId };
    }

    try {
      const response = await axios.post<JiraCreateIssueResponse>(
        url,
        { fields },
        {
          headers: this.getRequestHeaders(),
        },
      );

      return {
        id: response.data.id,
        key: response.data.key,
        self: response.data.self,
        assignedToMe: Boolean(params.assignToMe),
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          this.buildJiraErrorMessage(error, `create issue in project ${params.projectKey}`),
        );
      }

      throw new Error(
        `Failed to create issue in project ${params.projectKey}: ${(error as Error).message}`,
      );
    }
  }

  private buildJiraErrorMessage(error: AxiosError, action: string): string {
    if (error.response) {
      const jiraMessage = this.extractJiraErrorMessage(error.response.data);
      return `Failed to ${action}: ${jiraMessage}`;
    }

    if (error.request) {
      return `Failed to ${action}: Jira did not respond. Check the Jira URL and network connectivity.`;
    }

    return `Failed to ${action}: ${error.message}`;
  }

  private extractJiraErrorMessage(data: unknown): string {
    if (!data || typeof data !== 'object') {
      return 'Jira returned an unknown error.';
    }

    const jiraError = data as {
      message?: string;
      errorMessages?: string[];
      errors?: Record<string, string>;
    };

    if (Array.isArray(jiraError.errorMessages) && jiraError.errorMessages.length > 0) {
      return jiraError.errorMessages.join(', ');
    }

    if (jiraError.errors && Object.keys(jiraError.errors).length > 0) {
      return Object.values(jiraError.errors).join(', ');
    }

    if (jiraError.message) {
      return jiraError.message;
    }

    return 'Jira returned an unknown error.';
  }
}
