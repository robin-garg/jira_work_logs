import { z } from 'zod';

export const createIssueSchema = z.object({
  type: z.enum(['company', 'client'], {
    message: 'type must be either "company" or "client".',
  }),

  projectKey: z
    .string()
    .trim()
    .min(1, 'projectKey is required and must be a non-empty string.'),

  summary: z
    .string()
    .trim()
    .min(1, 'summary is required and must be a non-empty string.'),

  issueType: z
    .string()
    .trim()
    .min(1, 'issueType is required and must be a non-empty string.'),

  description: z
    .string()
    .trim()
    .min(1, 'description must be a non-empty string when provided.')
    .optional(),

  labels: z
    .array(z.string().trim().min(1, 'labels must contain non-empty strings.'))
    .optional(),

  priority: z
    .string()
    .trim()
    .min(1, 'priority must be a non-empty string when provided.')
    .optional(),

  assignToMe: z.boolean().optional(),
});
