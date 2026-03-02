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
 * Validates that a URL is properly formatted
 */
function validateUrl(url: string, varName: string): void {
  try {
    const parsedUrl = new URL(url);

    // Ensure it's HTTP or HTTPS
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      throw new Error(
        `Invalid ${varName}: URL must use http:// or https:// protocol.\n` +
        `Received: ${url}`
      );
    }

    // Ensure it has a hostname
    if (!parsedUrl.hostname) {
      throw new Error(
        `Invalid ${varName}: URL must have a valid hostname.\n` +
        `Received: ${url}`
      );
    }
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Invalid ${varName}: Not a valid URL format.\n` +
        `Expected format: https://your-domain.atlassian.net\n` +
        `Received: ${url}`
      );
    }
    throw error;
  }
}

/**
 * Validates that an email address is properly formatted
 * Uses a simple but effective regex pattern for email validation
 */
function validateEmail(email: string, varName: string): void {
  // RFC 5322 compliant email regex (simplified version)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new Error(
      `Invalid ${varName}: Must be a valid email address.\n` +
      `Jira Cloud API requires your Atlassian account email for authentication.\n` +
      `Expected format: user@example.com\n` +
      `Received: ${email}`
    );
  }
}

/**
 * Load and validate Jira configuration
 * This function is called immediately when the module is imported
 */
function loadJiraConfig(): JiraConfig {
  const baseUrl = getRequiredEnvVar('JIRA_BASE_URL');
  const email = getRequiredEnvVar('JIRA_EMAIL');
  const apiToken = getRequiredEnvVar('JIRA_API_TOKEN');

  // Validate that baseUrl is a proper URL
  validateUrl(baseUrl, 'JIRA_BASE_URL');

  // Validate that email is a proper email address
  // Jira Cloud API requires email for authentication
  validateEmail(email, 'JIRA_EMAIL');

  return {
    baseUrl,
    email,
    apiToken,
  };
}

// Load configuration once when module is imported
// If validation fails, this will throw and crash the app at startup
export const jiraConfig: JiraConfig = loadJiraConfig();

