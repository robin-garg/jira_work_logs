#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { IssueService } from '../../app/issue.service';
import { WorklogService, WorklogValidationError } from '../../app/worklog.service';
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

async function runCreateWorklog(argv: {
  type?: string;
  issueId?: string;
  message?: string;
  timeSpent?: string;
  date?: string;
}): Promise<void> {
  const parsed = createWorklogSchema.safeParse({
    type: argv.type,
    issueId: argv.issueId,
    message: argv.message,
    timeSpent: argv.timeSpent,
    date: argv.date,
  });

  if (!parsed.success) {
    console.error('✖ Validation Error:');
    for (const issue of parsed.error.issues) {
      console.error(`- ${issue.message}`);
    }
    process.exit(1);
  }

  const worklogService = new WorklogService(jiraServiceFactory);

  try {
    const result = await worklogService.createWorklog(parsed.data);

    console.log('✔ Worklog logged successfully');
    console.log(`Issue: ${result.issueId}`);
    console.log(`Time: ${parsed.data.timeSpent}`);

    process.exit(0);
  } catch (error) {
    const message = (error as Error).message;

    if (error instanceof WorklogValidationError) {
      console.error('✖ Validation Error:');
      console.error(`- ${message}`);
      process.exit(1);
    }

    console.error('✖ Failed to log worklog:');
    console.error(message);
    process.exit(1);
  }
}

async function runCreateIssue(argv: {
  type?: string;
  projectKey?: string;
  summary?: string;
  issueType?: string;
  description?: string;
  labels?: string | string[];
  priority?: string;
  assignToMe?: boolean;
}): Promise<void> {
  const labels = argv.labels
    ? Array.isArray(argv.labels)
      ? argv.labels
      : [argv.labels]
    : undefined;

  const parsed = createIssueSchema.safeParse({
    type: argv.type,
    projectKey: argv.projectKey,
    summary: argv.summary,
    issueType: argv.issueType,
    description: argv.description,
    labels,
    priority: argv.priority,
    assignToMe: argv.assignToMe,
  });

  if (!parsed.success) {
    console.error('✖ Validation Error:');
    for (const issue of parsed.error.issues) {
      console.error(`- ${issue.message}`);
    }
    process.exit(1);
  }

  const issueService = new IssueService(jiraServiceFactory);

  try {
    const result = await issueService.createIssue(parsed.data);

    console.log('✔ Issue created successfully');
    console.log(`Key: ${result.issueKey}`);
    console.log(`Id: ${result.issueId}`);
    if (result.assignedToMe) {
      console.log('Assignee: you (authenticated Jira user)');
    }

    process.exit(0);
  } catch (error) {
    console.error('✖ Failed to create issue:');
    console.error((error as Error).message);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  await yargs(hideBin(process.argv))
    .scriptName('jira-worklog')
    .command(
      '$0',
      'Log time to an existing Jira issue',
      (cmd) =>
        cmd
          .option('type', {
            type: 'string',
            describe: 'Jira instance type',
          })
          .option('issueId', {
            type: 'string',
            describe: 'Jira issue key',
          })
          .option('message', {
            type: 'string',
            describe: 'Worklog message',
          })
          .option('timeSpent', {
            type: 'string',
            describe: 'Time spent in Jira format',
          })
          .option('date', {
            type: 'string',
            describe: 'Optional worklog date',
          }),
      async (argv) => {
        await runCreateWorklog(argv);
      },
    )
    .command(
      'create-issue',
      'Create a new Jira issue',
      (cmd) =>
        cmd
          .option('type', {
            type: 'string',
            describe: 'Jira instance type (company or client)',
          })
          .option('projectKey', {
            type: 'string',
            describe: 'Jira project key, for example PROJ',
          })
          .option('summary', {
            type: 'string',
            describe: 'Issue summary / title',
          })
          .option('issueType', {
            type: 'string',
            describe: 'Issue type name, for example Task, Bug, or Story',
          })
          .option('description', {
            type: 'string',
            describe: 'Optional issue description',
          })
          .option('labels', {
            type: 'array',
            string: true,
            describe: 'Optional labels (space-separated)',
          })
          .option('priority', {
            type: 'string',
            describe: 'Optional priority name, for example High or Medium',
          })
          .option('assignToMe', {
            type: 'boolean',
            describe: 'Assign the new issue to the authenticated Jira user',
            default: false,
          }),
      async (argv) => {
        await runCreateIssue(argv);
      },
    )
    .strict()
    .help()
    .parseAsync();
}

void main();
