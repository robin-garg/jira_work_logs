#!/usr/bin/env node

import path from 'path';
import dotenv from 'dotenv';

// Load .env from the repo root so global MCP configs work regardless of cwd.
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { IssueService } from '../../app/issue.service';
import { WorklogService } from '../../app/worklog.service';
import { FakeJiraService, JiraService } from '../../infrastructure/jira';
import { getJiraConfigByType } from '../../infrastructure/jira/jira.config';
import { IJiraService, JiraInstanceType } from '../../types/worklog.types';
import { createIssueSchema } from '../../validation/issue.schema';
import { createWorklogSchema } from '../../validation/worklog.schema';

const jiraServiceFactory = (type: JiraInstanceType): IJiraService => {
  if (process.env.USE_FAKE_JIRA === 'true') {
    return new FakeJiraService();
  }

  const config = getJiraConfigByType(type);
  return new JiraService(config);
};

const worklogService = new WorklogService(jiraServiceFactory);
const issueService = new IssueService(jiraServiceFactory);

const server = new McpServer({
  name: 'jira-worklog-mcp',
  version: '1.0.0',
});

server.registerTool(
  'create_worklog',
  {
    title: 'Create Jira Worklog',
    description: 'Logs time to a company or client Jira issue.',
    inputSchema: {
      type: z.enum(['company', 'client']).describe('Jira instance type'),
      issueId: z.string().describe('Jira issue key, for example ABC-123'),
      message: z.string().describe('Worklog message'),
      timeSpent: z.string().describe('Time spent, for example 2h 30m'),
      date: z.string().optional().describe('Optional worklog date'),
    },
  },
  async (input) => {
    const parsed = createWorklogSchema.safeParse(input);

    if (!parsed.success) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: 'Validation Error',
                issues: parsed.error.issues.map((issue) => ({
                  field: issue.path.join('.'),
                  message: issue.message,
                })),
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    try {
      const result = await worklogService.createWorklog(parsed.data);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                data: result,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: 'Failed to log worklog',
                message: (error as Error).message,
              },
              null,
              2,
            ),
          },
        ],
      };
    }
  },
);

server.registerTool(
  'create_issue',
  {
    title: 'Create Jira Issue',
    description: 'Creates a new issue in a company or client Jira project.',
    inputSchema: {
      type: z.enum(['company', 'client']).describe('Jira instance type'),
      projectKey: z.string().describe('Jira project key, for example ABC'),
      summary: z.string().describe('Issue summary / title'),
      issueType: z.string().describe('Issue type name, for example Task, Bug, or Story'),
      description: z.string().optional().describe('Optional issue description'),
      labels: z.array(z.string()).optional().describe('Optional labels'),
      priority: z.string().optional().describe('Optional priority name, for example High or Medium'),
      assignToMe: z
        .boolean()
        .optional()
        .describe('When true, assign the new issue to the authenticated Jira user'),
    },
  },
  async (input) => {
    const parsed = createIssueSchema.safeParse(input);

    if (!parsed.success) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: 'Validation Error',
                issues: parsed.error.issues.map((issue) => ({
                  field: issue.path.join('.'),
                  message: issue.message,
                })),
              },
              null,
              2,
            ),
          },
        ],
      };
    }

    try {
      const result = await issueService.createIssue(parsed.data);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                success: true,
                data: result,
              },
              null,
              2,
            ),
          },
        ],
      };
    } catch (error) {
      return {
        isError: true,
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                error: 'Failed to create issue',
                message: (error as Error).message,
              },
              null,
              2,
            ),
          },
        ],
      };
    }
  },
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Jira Worklog MCP server running on stdio');
}

void main().catch((error) => {
  console.error('MCP server failed to start:', error);
  process.exit(1);
});
