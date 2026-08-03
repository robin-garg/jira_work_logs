#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { WorklogService } from '../../app/worklog.service';
import { getJiraConfigByType } from '../../infrastructure/jira/jira.config';
import { JiraService } from '../../infrastructure/jira/jira.service';
import { JiraInstanceType } from '../../types/worklog.types';
import { createWorklogSchema } from '../../validation/worklog.schema';

const jiraServiceFactory = (type: JiraInstanceType): JiraService => {
  const config = getJiraConfigByType(type);
  return new JiraService(config);
};

const worklogService = new WorklogService(jiraServiceFactory);

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

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Jira Worklog MCP server running on stdio');
}

void main().catch((error) => {
  console.error('MCP server failed to start:', error);
  process.exit(1);
});
