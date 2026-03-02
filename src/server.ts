import express, { Request, Response, Application } from 'express';
import dotenv from 'dotenv';

// This loads .env into: process.env
// Without this, your environment variables won’t exist in local dev.
// In production (like Docker), you may not need it.
dotenv.config();

// Import and validate Jira configuration
// If validation fails, the app will crash here at startup
import { jiraConfig } from './config/jira.config';

const app: Application = express();
const PORT = process.env.PORT || 3000;

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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 Health check available at http://localhost:${PORT}/health`);
  console.log(`✅ Jira configured for: ${jiraConfig.baseUrl}`);
});

export default app;

