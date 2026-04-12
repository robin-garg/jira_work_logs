/**
 * Worklog Controller Module
 * 
 * Handles HTTP requests for worklog operations.
 * Validates input, calls services, and returns appropriate responses.
 */

import { Request, Response } from 'express';
import { WorklogService } from '../services/worklog.service';
import { ApiResponse, CreateWorklogInput, JiraInstanceType } from '../types/worklog.types';

/**
 * WorklogController class
 * 
 * Handles all worklog-related HTTP requests.
 */
export class WorklogController {
  constructor(private readonly worklogService: WorklogService = new WorklogService()) {}

  async createWorklog(req: Request, res: Response): Promise<void> {
    const validationResult = this.validateRequestBody(req.body);

    if (!validationResult.success) {
      res.status(400).json(validationResult);
      return;
    }

    try {
      const requestData = validationResult.data;

      if (!requestData) {
        res.status(400).json({
          success: false,
          error: 'Request validation failed.',
        });
        return;
      }

      const result = await this.worklogService.createWorklog(requestData);

      // Success response
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message = (error as Error).message;
      const statusCode = message.toLowerCase().includes('invalid') ? 400 : 500;

      res.status(statusCode).json({
        success: false,
        error: message,
      });
    }
  }

  private validateRequestBody(body: unknown): ApiResponse<CreateWorklogInput> {
    if (!body || typeof body !== 'object') {
      return { success: false, error: 'Request body must be a JSON object.' };
    }

    const { type, issueId, message, timeSpent, date } = body as Partial<CreateWorklogInput>;

    if (!this.isValidJiraType(type)) {
      return { success: false, error: 'type is required and must be either "personal" or "client".' };
    }

    if (typeof issueId !== 'string' || issueId.trim() === '') {
      return { success: false, error: 'issueId is required and must be a non-empty string.' };
    }

    if (typeof message !== 'string' || message.trim() === '') {
      return { success: false, error: 'message is required and must be a non-empty string.' };
    }

    if (typeof timeSpent !== 'string' || timeSpent.trim() === '') {
      return { success: false, error: 'timeSpent is required and must be a non-empty string.' };
    }

    if (date !== undefined && (typeof date !== 'string' || date.trim() === '')) {
      return { success: false, error: 'date must be a non-empty string when provided.' };
    }

    return {
      success: true,
      data: {
        type,
        issueId: issueId.trim(),
        message: message.trim(),
        timeSpent: timeSpent.trim(),
        date: date?.trim(),
      },
    };
  }

  private isValidJiraType(type: unknown): type is JiraInstanceType {
    return type === 'personal' || type === 'client';
  }
}

