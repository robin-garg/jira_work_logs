/**
 * Jira Service Module
 * 
 * Provides methods to interact with Jira REST API.
 * Handles authentication, request formatting, and error handling.
 */

import axios, { AxiosError } from 'axios';
import { jiraConfig } from '../config/jira.config';

/**
 * JiraService class
 * 
 * Handles all Jira API interactions including worklog management.
 */
export class JiraService {
  /**
   * Builds the Basic Authentication header
   * 
   * Jira Cloud API uses Basic Auth with email:apiToken encoded in Base64
   * Format: "Basic base64(email:apiToken)"
   * 
   * @returns Authorization header value
   */
  private buildAuthHeader(): string {
    // Combine email and API token with colon separator
    const credentials = `${jiraConfig.email}:${jiraConfig.apiToken}`;
    
    // Encode to Base64 using Node.js Buffer
    const base64Credentials = Buffer.from(credentials).toString('base64');
    
    // Return in Basic Auth format
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
  async addWorklog(
    issueId: string,
    message: string,
    timeSpent: string,
    startedDate: string
  ): Promise<void> {
    // Build the Jira API endpoint URL
    const url = `${jiraConfig.baseUrl}/rest/api/3/issue/${issueId}/worklog`;

    // Build the request body according to Jira API specification
    const requestBody = {
      comment: message,
      timeSpent: timeSpent,
      started: startedDate,
    };

    try {
      // Make POST request to Jira API
      await axios.post(url, requestBody, {
        headers: {
          'Authorization': this.buildAuthHeader(),
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      // Success - no need to return anything (Promise<void>)
    } catch (error) {
      // Handle errors and throw clean, readable messages
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;

        // Extract meaningful error information from Jira response
        if (axiosError.response) {
          // Jira returned an error response
          const status = axiosError.response.status;
          const data = axiosError.response.data as any;

          // Try to extract error message from Jira response
          let errorMessage = 'Unknown error';
          
          if (data && typeof data === 'object') {
            // Jira error responses can have different formats
            if (data.errorMessages && Array.isArray(data.errorMessages) && data.errorMessages.length > 0) {
              errorMessage = data.errorMessages.join(', ');
            } else if (data.errors && typeof data.errors === 'object') {
              errorMessage = Object.values(data.errors).join(', ');
            } else if (data.message) {
              errorMessage = data.message;
            }
          }

          // Throw clean error with status and message
          throw new Error(
            `Failed to add worklog to issue ${issueId}.\n` +
            `Status: ${status}\n` +
            `Error: ${errorMessage}`
          );
        } else if (axiosError.request) {
          // Request was made but no response received (network error)
          throw new Error(
            `Failed to add worklog to issue ${issueId}.\n` +
            `Network error: No response from Jira server.\n` +
            `Please check your network connection and Jira URL.`
          );
        } else {
          // Error setting up the request
          throw new Error(
            `Failed to add worklog to issue ${issueId}.\n` +
            `Error: ${axiosError.message}`
          );
        }
      } else {
        // Non-Axios error (shouldn't happen, but handle it)
        throw new Error(
          `Failed to add worklog to issue ${issueId}.\n` +
          `Error: ${(error as Error).message}`
        );
      }
    }
  }
}

