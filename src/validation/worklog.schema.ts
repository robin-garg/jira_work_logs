// src/validation/worklog.schema.ts

import { z } from 'zod';

export const createWorklogSchema = z.object({
  type: z.enum(['company', 'client'], {
    message: 'type must be either "company" or "client".',
  }),

  issueId: z
    .string()
    .trim()
    .min(1, 'issueId is required and must be a non-empty string.'),

  message: z
    .string()
    .trim()
    .min(1, 'message is required and must be a non-empty string.'),

  timeSpent: z
    .string()
    .trim()
    .min(1, 'timeSpent is required and must be a non-empty string.'),

  date: z
    .string()
    .trim()
    .min(1, 'date must be a non-empty string when provided.')
    .optional(),
});

// Optional (recommended later)
// export type CreateWorklogInput = z.infer<typeof createWorklogSchema>;