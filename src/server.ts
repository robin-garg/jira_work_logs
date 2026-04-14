// IMPORTANT: Load environment variables FIRST before any other imports
import dotenv from 'dotenv';
dotenv.config();

import express, { Application, Request, Response } from 'express';
import { getJiraConfigByType, jiraConfigs } from './config/jira.config';
import { WorklogController } from './controllers/worklog.controller';
import { JiraService } from './services/jira.service';
import { WorklogService } from './services/worklog.service';
import { JiraInstanceType } from './types/worklog.types';

const app: Application = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const jiraServiceFactory = (type: JiraInstanceType): JiraService => {
  const config = getJiraConfigByType(type);
  return new JiraService(config);
};

const worklogService = new WorklogService(jiraServiceFactory);
const worklogController = new WorklogController(worklogService);

// Middleware

/* This parses:
{
  "issueId": "COMP-123"
}
into:
req.body.issueId
Without this, req.body would be undefined.
*/
app.use(express.json());
/*
This is for handling:

application/x-www-form-urlencoded

Usually used in form submissions.
For API-only service, this is optional.
We can remove later if not needed.
*/
app.use(express.urlencoded({ extended: true }));

// Health check route
// In production systems:
// Load balancers call this
// Monitoring systems check this
// Kubernetes checks this
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

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
  console.log(`Personal Jira configured for: ${jiraConfigs.personal.baseUrl}`);
  console.log(`Client Jira configured for: ${jiraConfigs.client.baseUrl}`);
});

export default app;
