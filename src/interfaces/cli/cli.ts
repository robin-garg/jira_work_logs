#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { WorklogService, WorklogValidationError } from '../../app/worklog.service';
import { getJiraConfigByType } from '../../infrastructure/jira/jira.config';
import { JiraService } from '../../infrastructure/jira/jira.service';
import { JiraInstanceType } from '../../types/worklog.types';
import { createWorklogSchema } from '../../validation/worklog.schema';

const jiraServiceFactory = (type: JiraInstanceType): JiraService => {
  const config = getJiraConfigByType(type);
  return new JiraService(config);
};

async function main(): Promise<void> {
  const argv = yargs(hideBin(process.argv))
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
    })
    .strict()
    .help()
    .parseSync();

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

void main();
