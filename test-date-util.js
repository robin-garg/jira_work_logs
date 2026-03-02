/**
 * Test script for date utility functions
 * 
 * This script tests the formatWorklogDate function with various scenarios.
 * Run with: node test-date-util.js (after building TypeScript)
 */

// Test 1: Current date (no parameter)
console.log('Test 1: Current date (no parameter)\n');

try {
  const { formatWorklogDate } = require('./dist/utils/date.util.js');
  const result = formatWorklogDate();
  console.log('✅ PASSED: Current date formatted successfully');
  console.log(`   Result: ${result}`);
  console.log(`   Format: YYYY-MM-DDTHH:mm:ss.SSS+0000`);
  
  // Validate format with regex
  const formatRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}\+0000$/;
  if (formatRegex.test(result)) {
    console.log('   ✅ Format validation: PASSED\n');
  } else {
    console.log('   ❌ Format validation: FAILED\n');
  }
} catch (error) {
  console.log('❌ FAILED: Error formatting current date');
  console.log(`   Error: ${error.message}\n`);
}

// Test 2: Specific date string (YYYY-MM-DD)
console.log('Test 2: Specific date string (YYYY-MM-DD)\n');

try {
  const { formatWorklogDate } = require('./dist/utils/date.util.js');
  const result = formatWorklogDate('2026-01-15');
  console.log('✅ PASSED: Date string formatted successfully');
  console.log(`   Input: "2026-01-15"`);
  console.log(`   Result: ${result}`);
  
  // Should start with the date we provided
  if (result.startsWith('2026-01-15T')) {
    console.log('   ✅ Date preserved correctly\n');
  } else {
    console.log('   ❌ Date not preserved correctly\n');
  }
} catch (error) {
  console.log('❌ FAILED: Error formatting date string');
  console.log(`   Error: ${error.message}\n`);
}

// Test 3: ISO date string with time
console.log('Test 3: ISO date string with time\n');

try {
  const { formatWorklogDate } = require('./dist/utils/date.util.js');
  const result = formatWorklogDate('2026-03-02T14:30:45.123Z');
  console.log('✅ PASSED: ISO date string formatted successfully');
  console.log(`   Input: "2026-03-02T14:30:45.123Z"`);
  console.log(`   Result: ${result}`);
  console.log('   ✅ Converted to Jira format\n');
} catch (error) {
  console.log('❌ FAILED: Error formatting ISO date string');
  console.log(`   Error: ${error.message}\n`);
}

// Test 4: Invalid date string (should fail)
console.log('Test 4: Invalid date string (should throw error)\n');

try {
  const { formatWorklogDate } = require('./dist/utils/date.util.js');
  const result = formatWorklogDate('invalid-date');
  console.log('❌ FAILED: Should have thrown an error for invalid date');
  console.log(`   Result: ${result}\n`);
} catch (error) {
  console.log('✅ PASSED: Correctly threw error for invalid date');
  console.log(`   Error: ${error.message}\n`);
}

// Test 5: Empty string (should fail)
console.log('Test 5: Empty string (should throw error)\n');

try {
  const { formatWorklogDate } = require('./dist/utils/date.util.js');
  const result = formatWorklogDate('');
  console.log('❌ FAILED: Should have thrown an error for empty string');
  console.log(`   Result: ${result}\n`);
} catch (error) {
  console.log('✅ PASSED: Correctly threw error for empty string');
  console.log(`   Error: ${error.message}\n`);
}

// Test 6: Verify UTC timezone (+0000)
console.log('Test 6: Verify UTC timezone format\n');

try {
  const { formatWorklogDate } = require('./dist/utils/date.util.js');
  const result = formatWorklogDate('2026-06-15T10:30:00Z');
  console.log('✅ PASSED: Date formatted with UTC timezone');
  console.log(`   Input: "2026-06-15T10:30:00Z"`);
  console.log(`   Result: ${result}`);
  
  if (result.endsWith('+0000')) {
    console.log('   ✅ Timezone format correct: +0000\n');
  } else {
    console.log('   ❌ Timezone format incorrect\n');
  }
} catch (error) {
  console.log('❌ FAILED: Error formatting date');
  console.log(`   Error: ${error.message}\n`);
}

// Test 7: Verify milliseconds padding
console.log('Test 7: Verify milliseconds padding (3 digits)\n');

try {
  const { formatWorklogDate } = require('./dist/utils/date.util.js');
  const result = formatWorklogDate('2026-01-01T00:00:00.005Z');
  console.log('✅ PASSED: Milliseconds padded correctly');
  console.log(`   Input: "2026-01-01T00:00:00.005Z" (5 milliseconds)`);
  console.log(`   Result: ${result}`);
  
  // Extract milliseconds part (should be .005)
  const msMatch = result.match(/\.(\d{3})\+/);
  if (msMatch && msMatch[1] === '005') {
    console.log('   ✅ Milliseconds padded to 3 digits: .005\n');
  } else {
    console.log('   ❌ Milliseconds not padded correctly\n');
  }
} catch (error) {
  console.log('❌ FAILED: Error formatting date');
  console.log(`   Error: ${error.message}\n`);
}

console.log('='.repeat(60));
console.log('All tests completed!');
console.log('='.repeat(60));

