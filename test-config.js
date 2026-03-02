/**
 * Test script to verify Jira config validation
 * 
 * This script demonstrates that the config module properly validates
 * environment variables and crashes when they're missing.
 */

// Test 1: Missing environment variables (should fail)
console.log('Test 1: Testing with missing environment variables...\n');

// Clear any existing env vars
delete process.env.JIRA_BASE_URL;
delete process.env.JIRA_EMAIL;
delete process.env.JIRA_API_TOKEN;

try {
  // This should throw an error
  require('./dist/config/jira.config.js');
  console.log('❌ FAILED: Config should have thrown an error for missing variables\n');
} catch (error) {
  console.log('✅ PASSED: Config correctly threw an error:');
  console.log(`   ${error.message}\n`);
}

// Test 2: With valid environment variables (should succeed)
console.log('Test 2: Testing with valid environment variables...\n');

process.env.JIRA_BASE_URL = 'https://test.atlassian.net';
process.env.JIRA_EMAIL = 'test@example.com';
process.env.JIRA_API_TOKEN = 'test-token-123';

// Clear the require cache to reload the module
delete require.cache[require.resolve('./dist/config/jira.config.js')];

try {
  const { jiraConfig } = require('./dist/config/jira.config.js');
  console.log('✅ PASSED: Config loaded successfully:');
  console.log(`   Base URL: ${jiraConfig.baseUrl}`);
  console.log(`   Email: ${jiraConfig.email}`);
  console.log(`   API Token: ${jiraConfig.apiToken.substring(0, 10)}...`);
} catch (error) {
  console.log('❌ FAILED: Config should have loaded successfully');
  console.log(`   Error: ${error.message}`);
}

