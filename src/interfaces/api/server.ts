// IMPORTANT: Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response } from 'express';
import { WorklogService } from '../../app/worklog.service';
import { getJiraConfigByType } from '../../infrastructure/jira/jira.config';
import { JiraService } from '../../infrastructure/jira/jira.service';
import { JiraInstanceType } from '../../types/worklog.types';
import { WorklogController } from './worklog.controller';

const app: Application = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const jiraServiceFactory = (type: JiraInstanceType): JiraService => {
  const config = getJiraConfigByType(type);
  return new JiraService(config);
};

const worklogService = new WorklogService(jiraServiceFactory);
const worklogController = new WorklogController(worklogService);

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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
  console.log(`Company Jira configured for: ${getJiraConfigByType('company').baseUrl}`);
  console.log(`Client Jira configured for: ${getJiraConfigByType('client').baseUrl}`);
});

export default app;
