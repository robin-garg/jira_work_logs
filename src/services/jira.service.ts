/**
 * Jira Service Module
 * 
 * Provides methods to interact with Jira REST API.
 * Handles authentication, request formatting, and error handling.
 */

import axios, { AxiosError } from 'axios';
import { JiraConfig } from '../types/worklog.types';
import { parseTimeToSeconds } from '../utils/time.util';

interface AddWorklogParams {
  issueId: string;
  message: string;
  timeSpent: string;
  started: string;
}

interface JiraWorklogResponse {
  id?: string;
}

interface AddWorklogResult {
  worklogId?: string;
  timeSpentSeconds: number;
}

/**
 * JiraService class
 * 
 * Handles all Jira API interactions including worklog management.
 */
export class JiraService {
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
   * Adds a worklog entry to a Jira issue
   * 
   * @param issueId - The Jira issue ID (e.g., "PROJ-123")
   * @param message - The worklog comment/description
   * @param timeSpent - Time spent in Jira format (e.g., "2h 30m", "1d", "45m")
   * @param startedDate - When the work started (Jira format: YYYY-MM-DDTHH:mm:ss.SSS+0000)
   * @throws Error if the API request fails with a clean, readable message
   * 
   * @example
   * const jiraService = new JiraService();
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
      comment: params.message,
      started: params.started,
      timeSpentSeconds,
    };

    try {
      const response = await axios.post<JiraWorklogResponse>(url, requestBody, {
        headers: {
          Authorization: this.buildAuthHeader(),
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      });

      return {
        worklogId: response.data?.id,
        timeSpentSeconds,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(this.buildJiraErrorMessage(error, params.issueId));
      }

      throw new Error(`Failed to add worklog to issue ${params.issueId}: ${(error as Error).message}`);
    }
  }

  private buildJiraErrorMessage(error: AxiosError, issueId: string): string {
    if (error.response) {
      const jiraMessage = this.extractJiraErrorMessage(error.response.data);
      return `Failed to add worklog to issue ${issueId}: ${jiraMessage}`;
    }

    if (error.request) {
      return `Failed to add worklog to issue ${issueId}: Jira did not respond. Check the Jira URL and network connectivity.`;
    }

    return `Failed to add worklog to issue ${issueId}: ${error.message}`;
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

