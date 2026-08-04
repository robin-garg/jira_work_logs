// IMPORTANT: Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response } from 'express';
import { IssueService } from '../../app/issue.service';
import { WorklogService } from '../../app/worklog.service';
import { FakeJiraService, JiraService } from '../../infrastructure/jira';
import { getJiraConfigByType } from '../../infrastructure/jira/jira.config';
import { IJiraService, JiraInstanceType } from '../../types/worklog.types';
import { IssueController } from './issue.controller';
import { WorklogController } from './worklog.controller';

const app: Application = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const useFakeJira = process.env.USE_FAKE_JIRA === 'true';

const jiraServiceFactory = (type: JiraInstanceType): IJiraService => {
  if (useFakeJira) {
    return new FakeJiraService();
  }

  const config = getJiraConfigByType(type);
  return new JiraService(config);
};

const worklogService = new WorklogService(jiraServiceFactory);
const worklogController = new WorklogController(worklogService);
const issueService = new IssueService(jiraServiceFactory);
const issueController = new IssueController(issueService);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.post('/worklog', async (req: Request, res: Response) => {
  await worklogController.createWorklog(req, res);
});

app.post('/issue', async (req: Request, res: Response) => {
  await issueController.createIssue(req, res);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);

  if (useFakeJira) {
    console.log('Using FakeJiraService (USE_FAKE_JIRA=true)');
  } else {
    console.log(`Company Jira configured for: ${getJiraConfigByType('company').baseUrl}`);
    console.log(`Client Jira configured for: ${getJiraConfigByType('client').baseUrl}`);
  }
});

export default app;
