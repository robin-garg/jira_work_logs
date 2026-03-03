/**
 * Demo script for Jira Service
 * 
 * This demonstrates how to use the JiraService class to add worklogs.
 * Run with: npx ts-node demo-jira-service.ts
 * 
 * NOTE: This will make a REAL API call to Jira if you have valid credentials.
 * Make sure to use a test issue ID or comment out the actual call.
 */

import dotenv from 'dotenv';
dotenv.config();

import { JiraService } from './src/services/jira.service';
import { formatWorklogDate } from './src/utils/date.util';

console.log('='.repeat(60));
console.log('Jira Service Demo - addWorklog()');
console.log('='.repeat(60));
console.log();

async function demo() {
  // Create an instance of JiraService
  const jiraService = new JiraService();

  // Example 1: Add worklog with current date
  console.log('1️⃣  Example: Add worklog with current date');
  console.log();
  
  const issueId = 'PROJ-123'; // Replace with your actual issue ID
  const message = 'Fixed authentication bug and added unit tests';
  const timeSpent = '2h 30m';
  const startedDate = formatWorklogDate(); // Current date in Jira format

  console.log('   Parameters:');
  console.log(`   - Issue ID: ${issueId}`);
  console.log(`   - Message: ${message}`);
  console.log(`   - Time Spent: ${timeSpent}`);
  console.log(`   - Started: ${startedDate}`);
  console.log();

  // UNCOMMENT THE FOLLOWING TO MAKE A REAL API CALL
  // WARNING: This will add a worklog to your Jira issue!
  /*
  try {
    await jiraService.addWorklog(issueId, message, timeSpent, startedDate);
    console.log('   ✅ Worklog added successfully!');
  } catch (error) {
    console.log('   ❌ Error adding worklog:');
    console.log(`   ${(error as Error).message}`);
  }
  */
  console.log('   ⚠️  API call commented out (see demo-jira-service.ts)');
  console.log();

  // Example 2: Add worklog with specific date
  console.log('2️⃣  Example: Add worklog with specific date');
  console.log();

  const specificDate = formatWorklogDate('2026-03-01T09:00:00Z');
  
  console.log('   Parameters:');
  console.log(`   - Issue ID: ${issueId}`);
  console.log(`   - Message: Code review and refactoring`);
  console.log(`   - Time Spent: 1h 15m`);
  console.log(`   - Started: ${specificDate}`);
  console.log();

  // UNCOMMENT TO MAKE A REAL API CALL
  /*
  try {
    await jiraService.addWorklog(
      issueId,
      'Code review and refactoring',
      '1h 15m',
      specificDate
    );
    console.log('   ✅ Worklog added successfully!');
  } catch (error) {
    console.log('   ❌ Error adding worklog:');
    console.log(`   ${(error as Error).message}`);
  }
  */
  console.log('   ⚠️  API call commented out (see demo-jira-service.ts)');
  console.log();

  // Example 3: Error handling - invalid issue ID
  console.log('3️⃣  Example: Error handling (invalid issue ID)');
  console.log();

  console.log('   Parameters:');
  console.log(`   - Issue ID: INVALID-999`);
  console.log(`   - Message: Test worklog`);
  console.log(`   - Time Spent: 30m`);
  console.log(`   - Started: ${formatWorklogDate()}`);
  console.log();

  // UNCOMMENT TO TEST ERROR HANDLING
  /*
  try {
    await jiraService.addWorklog(
      'INVALID-999',
      'Test worklog',
      '30m',
      formatWorklogDate()
    );
    console.log('   ✅ Worklog added successfully!');
  } catch (error) {
    console.log('   ✅ Error caught and handled:');
    console.log(`   ${(error as Error).message}`);
  }
  */
  console.log('   ⚠️  API call commented out (see demo-jira-service.ts)');
  console.log();
}

console.log('='.repeat(60));
console.log('Usage Instructions:');
console.log('='.repeat(60));
console.log();
console.log('1. Make sure your .env file has valid Jira credentials');
console.log('2. Replace PROJ-123 with a real issue ID from your Jira');
console.log('3. Uncomment the API calls in this file');
console.log('4. Run: npx ts-node demo-jira-service.ts');
console.log();
console.log('='.repeat(60));
console.log();

demo().catch(error => {
  console.error('Demo failed:', error);
  process.exit(1);
});

