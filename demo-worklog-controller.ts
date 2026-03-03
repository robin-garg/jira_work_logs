/**
 * Demo script for Worklog Controller
 * 
 * This demonstrates how the WorklogController validates input and handles requests.
 * This is a simulation - in real usage, Express will call the controller.
 * 
 * Run with: npx ts-node demo-worklog-controller.ts
 */

import dotenv from 'dotenv';
dotenv.config();

import { Request, Response } from 'express';
import { WorklogController } from './src/controllers/worklog.controller';

console.log('='.repeat(60));
console.log('Worklog Controller Demo - createWorklog()');
console.log('='.repeat(60));
console.log();

// Mock Response object for testing
function createMockResponse(): Response {
  const res: any = {
    statusCode: 200,
    jsonData: null,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(data: any) {
      this.jsonData = data;
      return this;
    },
  };
  return res as Response;
}

// Mock Request object for testing
function createMockRequest(body: any): Request {
  return { body } as Request;
}

async function demo() {
  const controller = new WorklogController();

  // Test 1: Valid request with all required fields
  console.log('1️⃣  Test: Valid request (all required fields)');
  console.log();
  
  const req1 = createMockRequest({
    issueId: 'PROJ-123',
    message: 'Fixed authentication bug',
    timeSpent: '2h 30m',
  });
  const res1 = createMockResponse();

  console.log('   Request body:');
  console.log(`   ${JSON.stringify(req1.body, null, 2)}`);
  console.log();

  // UNCOMMENT TO TEST WITH REAL JIRA API
  /*
  await controller.createWorklog(req1, res1);
  console.log(`   Response status: ${(res1 as any).statusCode}`);
  console.log(`   Response body: ${JSON.stringify((res1 as any).jsonData, null, 2)}`);
  */
  console.log('   ⚠️  API call commented out (see demo-worklog-controller.ts)');
  console.log();

  // Test 2: Valid request with optional date
  console.log('2️⃣  Test: Valid request (with optional date)');
  console.log();

  const req2 = createMockRequest({
    issueId: 'PROJ-456',
    message: 'Code review and refactoring',
    timeSpent: '1h 15m',
    date: '2026-03-01T09:00:00Z',
  });
  const res2 = createMockResponse();

  console.log('   Request body:');
  console.log(`   ${JSON.stringify(req2.body, null, 2)}`);
  console.log();

  // UNCOMMENT TO TEST WITH REAL JIRA API
  /*
  await controller.createWorklog(req2, res2);
  console.log(`   Response status: ${(res2 as any).statusCode}`);
  console.log(`   Response body: ${JSON.stringify((res2 as any).jsonData, null, 2)}`);
  */
  console.log('   ⚠️  API call commented out (see demo-worklog-controller.ts)');
  console.log();

  // Test 3: Missing required field (issueId)
  console.log('3️⃣  Test: Validation error (missing issueId)');
  console.log();

  const req3 = createMockRequest({
    message: 'Test worklog',
    timeSpent: '30m',
  });
  const res3 = createMockResponse();

  console.log('   Request body:');
  console.log(`   ${JSON.stringify(req3.body, null, 2)}`);
  console.log();

  await controller.createWorklog(req3, res3);
  console.log(`   ✅ Response status: ${(res3 as any).statusCode}`);
  console.log(`   ✅ Response body:`);
  console.log(`   ${JSON.stringify((res3 as any).jsonData, null, 2)}`);
  console.log();

  // Test 4: Missing required field (message)
  console.log('4️⃣  Test: Validation error (missing message)');
  console.log();

  const req4 = createMockRequest({
    issueId: 'PROJ-789',
    timeSpent: '1h',
  });
  const res4 = createMockResponse();

  console.log('   Request body:');
  console.log(`   ${JSON.stringify(req4.body, null, 2)}`);
  console.log();

  await controller.createWorklog(req4, res4);
  console.log(`   ✅ Response status: ${(res4 as any).statusCode}`);
  console.log(`   ✅ Response body:`);
  console.log(`   ${JSON.stringify((res4 as any).jsonData, null, 2)}`);
  console.log();

  // Test 5: Invalid date format
  console.log('5️⃣  Test: Validation error (invalid date)');
  console.log();

  const req5 = createMockRequest({
    issueId: 'PROJ-999',
    message: 'Test worklog',
    timeSpent: '45m',
    date: 'invalid-date-format',
  });
  const res5 = createMockResponse();

  console.log('   Request body:');
  console.log(`   ${JSON.stringify(req5.body, null, 2)}`);
  console.log();

  await controller.createWorklog(req5, res5);
  console.log(`   ✅ Response status: ${(res5 as any).statusCode}`);
  console.log(`   ✅ Response body:`);
  console.log(`   ${JSON.stringify((res5 as any).jsonData, null, 2)}`);
  console.log();
}

console.log('='.repeat(60));
console.log('Controller Validation Tests');
console.log('='.repeat(60));
console.log();

demo().catch(error => {
  console.error('Demo failed:', error);
  process.exit(1);
});

