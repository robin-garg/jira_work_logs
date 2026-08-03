/**
 * Issue Controller Module
 *
 * Handles HTTP requests for Jira issue creation.
 * Validates input, calls services, and returns appropriate responses.
 */

import { Request, Response } from 'express';
import { IssueService } from '../../app/issue.service';
import { createIssueSchema } from '../../validation/issue.schema';

/**
 * IssueController class
 *
 * Handles all issue-related HTTP requests.
 */
export class IssueController {
  constructor(private readonly issueService: IssueService) {}

  async createIssue(req: Request, res: Response): Promise<void> {
    const parsed = createIssueSchema.safeParse(req.body);

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

    try {
      const result = await this.issueService.createIssue(parsed.data);

      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  }
}
