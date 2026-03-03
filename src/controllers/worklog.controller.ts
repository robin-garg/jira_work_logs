/**
 * Worklog Controller Module
 * 
 * Handles HTTP requests for worklog operations.
 * Validates input, calls services, and returns appropriate responses.
 */

import { Request, Response } from 'express';
import { JiraService } from '../services/jira.service';
import { formatWorklogDate } from '../utils/date.util';

/**
 * WorklogController class
 * 
 * Handles all worklog-related HTTP requests.
 */
export class WorklogController {
  /**
   * Creates a new worklog entry for a Jira issue
   * 
   * Expected request body:
   * {
   *   issueId: string (required) - The Jira issue ID (e.g., "PROJ-123")
   *   message: string (required) - The worklog comment/description
   *   timeSpent: string (required) - Time spent (e.g., "2h 30m", "1d", "45m")
   *   date: string (optional) - When work started (ISO date string)
   * }
   * 
   * Success response (200):
   * {
   *   success: true,
   *   message: "Worklog added successfully"
   * }
   * 
   * Validation error response (400):
   * {
   *   success: false,
   *   message: "Validation error message"
   * }
   * 
   * Server error response (500):
   * {
   *   success: false,
   *   message: "Error message"
   * }
   * 
   * @param req - Express Request object
   * @param res - Express Response object
   */
  async createWorklog(req: Request, res: Response): Promise<void> {
    try {
      // Extract fields from request body
      const { issueId, message, timeSpent, date } = req.body;

      // Validation: Check required fields
      // issueId is required
      if (!issueId || typeof issueId !== 'string' || issueId.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'Validation failed: issueId is required and must be a non-empty string',
        });
        return;
      }

      // message is required
      if (!message || typeof message !== 'string' || message.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'Validation failed: message is required and must be a non-empty string',
        });
        return;
      }

      // timeSpent is required
      if (!timeSpent || typeof timeSpent !== 'string' || timeSpent.trim() === '') {
        res.status(400).json({
          success: false,
          message: 'Validation failed: timeSpent is required and must be a non-empty string',
        });
        return;
      }

      // date is optional, but if provided, must be a string
      if (date !== undefined && typeof date !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Validation failed: date must be a string if provided',
        });
        return;
      }

      // Format the date for Jira
      // If date is provided, use it; otherwise, use current date
      let startedDate: string;
      try {
        startedDate = formatWorklogDate(date);
      } catch (error) {
        // Date formatting failed (invalid date format)
        res.status(400).json({
          success: false,
          message: `Validation failed: ${(error as Error).message}`,
        });
        return;
      }

      // Create JiraService instance
      const jiraService = new JiraService();

      // Call the service to add worklog
      await jiraService.addWorklog(
        issueId.trim(),
        message.trim(),
        timeSpent.trim(),
        startedDate
      );

      // Success response
      res.status(200).json({
        success: true,
        message: 'Worklog added successfully',
      });

    } catch (error) {
      // Handle any errors from the service layer
      // Return 500 with clean error message (no stack traces)
      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }
}

