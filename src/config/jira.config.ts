/**
 * Jira Configuration Module
 * 
 * This module validates and exports Jira configuration from environment variables.
 * If any required variable is missing, it throws an error immediately.
 * This ensures the app crashes at startup if misconfigured.
 */

interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
}

/**
 * Validates that a required environment variable exists and is not empty
 */
function getRequiredEnvVar(key: string): string {
  const value = process.env[key];
  
  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Please set ${key} in your .env file or environment.`
    );
  }
  
  return value.trim();
}

/**
 * Load and validate Jira configuration
 * This function is called immediately when the module is imported
 */
function loadJiraConfig(): JiraConfig {
  return {
    baseUrl: getRequiredEnvVar('JIRA_BASE_URL'),
    email: getRequiredEnvVar('JIRA_EMAIL'),
    apiToken: getRequiredEnvVar('JIRA_API_TOKEN'),
  };
}

// Load configuration once when module is imported
// If validation fails, this will throw and crash the app at startup
export const jiraConfig: JiraConfig = loadJiraConfig();

