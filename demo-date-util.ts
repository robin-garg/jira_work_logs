/**
 * Demo script for date utility
 * 
 * This demonstrates the formatWorklogDate function usage.
 * Run with: npx ts-node demo-date-util.ts
 */

import { formatWorklogDate } from './src/utils/date.util';

console.log('='.repeat(60));
console.log('Date Utility Demo - formatWorklogDate()');
console.log('='.repeat(60));
console.log();

// Demo 1: Current date
console.log('1️⃣  Current date (no parameter):');
try {
  const result = formatWorklogDate();
  console.log(`   Result: ${result}`);
  console.log(`   ✅ Success\n`);
} catch (error) {
  console.log(`   ❌ Error: ${(error as Error).message}\n`);
}

// Demo 2: Specific date
console.log('2️⃣  Specific date (YYYY-MM-DD):');
try {
  const result = formatWorklogDate('2026-01-15');
  console.log(`   Input:  "2026-01-15"`);
  console.log(`   Result: ${result}`);
  console.log(`   ✅ Success\n`);
} catch (error) {
  console.log(`   ❌ Error: ${(error as Error).message}\n`);
}

// Demo 3: ISO date with time
console.log('3️⃣  ISO date with time:');
try {
  const result = formatWorklogDate('2026-03-02T14:30:45.123Z');
  console.log(`   Input:  "2026-03-02T14:30:45.123Z"`);
  console.log(`   Result: ${result}`);
  console.log(`   ✅ Success\n`);
} catch (error) {
  console.log(`   ❌ Error: ${(error as Error).message}\n`);
}

// Demo 4: Invalid date (should throw error)
console.log('4️⃣  Invalid date (should throw error):');
try {
  const result = formatWorklogDate('invalid-date');
  console.log(`   Result: ${result}`);
  console.log(`   ❌ Should have thrown error\n`);
} catch (error) {
  console.log(`   Input:  "invalid-date"`);
  console.log(`   ✅ Correctly threw error:`);
  console.log(`   ${(error as Error).message}\n`);
}

console.log('='.repeat(60));
console.log('Format: YYYY-MM-DDTHH:mm:ss.SSS+0000');
console.log('Example: 2026-03-02T14:30:45.123+0000');
console.log('='.repeat(60));

