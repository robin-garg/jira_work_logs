import { JiraConfig, JiraInstanceType } from '../../types/worklog.types';

/**
 * Validates that a required environment variable exists and is not empty
 */
function getRequiredEnvVar(key: string): string {
  const value = process.env[key];

  if (!value || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${key}\n` +
      `Please set ${key} in your .env file or environment.`,
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
        `Received: ${url}`,
      );
    }

    // Ensure it has a hostname
    if (!parsedUrl.hostname) {
      throw new Error(
        `Invalid ${varName}: URL must have a valid hostname.\n` +
        `Received: ${url}`,
      );
    }
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(
        `Invalid ${varName}: Not a valid URL format.\n` +
        `Expected format: https://your-domain.atlassian.net\n` +
        `Received: ${url}`,
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
      `Received: ${email}`,
    );
  }
}

/**
 * Load and validate Jira configuration
 * This function is called immediately when the module is imported
 */
function loadSingleJiraConfig(prefix: 'PERSONAL' | 'CLIENT'): JiraConfig {
  const baseUrl = getRequiredEnvVar(`${prefix}_JIRA_BASE_URL`);
  const email = getRequiredEnvVar(`${prefix}_JIRA_EMAIL`);
  const apiToken = getRequiredEnvVar(`${prefix}_JIRA_API_TOKEN`);

  validateUrl(baseUrl, `${prefix}_JIRA_BASE_URL`);
  validateEmail(email, `${prefix}_JIRA_EMAIL`);

  return { baseUrl, email, apiToken };
}

export const jiraConfigs: Record<JiraInstanceType, JiraConfig> = {
  personal: loadSingleJiraConfig('PERSONAL'),
  client: loadSingleJiraConfig('CLIENT'),
};

export function getJiraConfigByType(type: JiraInstanceType): JiraConfig {
  const config = jiraConfigs[type];

  if (!config) {
    throw new Error(`Unsupported Jira type: ${type}`);
  }

  return config;
}
