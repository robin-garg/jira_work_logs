/**
 * Worklog Controller Module
 * 
 * Handles HTTP requests for worklog operations.
 * Validates input, calls services, and returns appropriate responses.
 */

import { Request, Response } from 'express';
import { WorklogService, WorklogValidationError } from '../services/worklog.service';
import { createWorklogSchema } from '../validation/worklog.schema';

/**
 * WorklogController class
 * 
 * Handles all worklog-related HTTP requests.
 */
export class WorklogController {
  constructor(private readonly worklogService: WorklogService) {}

  async createWorklog(req: Request, res: Response): Promise<void> {
    const parsed = createWorklogSchema.safeParse(req.body);

    if (!parsed.success) {
      const errors = parsed.error.issues.map((issue) => ({
        field: issue.path[0] as string,
        message: issue.message,
      }));

      res.status(400).json({
        success: false,
        errors,
      });
      return;
    }

    const requestData = parsed.data;

    try {
      const result = await this.worklogService.createWorklog(requestData);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      const message = (error as Error).message;
      const statusCode =
        error instanceof WorklogValidationError ? 400 : 500;

      res.status(statusCode).json({
        success: false,
        error: message,
      });
    }
  }
}
