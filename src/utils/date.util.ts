/**
 * Date Utility Module
 * 
 * Provides date formatting utilities for Jira API integration.
 * All functions use native JavaScript Date object without external libraries.
 */

/**
 * Pads a number with leading zeros to ensure it has at least 2 digits
 * @param num - The number to pad
 * @returns Padded string (e.g., 5 -> "05", 12 -> "12")
 */
function padZero(num: number): string {
  return num.toString().padStart(2, '0');
}

/**
 * Pads a number with leading zeros to ensure it has at least 3 digits
 * Used for milliseconds formatting
 * @param num - The number to pad
 * @returns Padded string (e.g., 5 -> "005", 50 -> "050", 500 -> "500")
 */
function padMilliseconds(num: number): string {
  return num.toString().padStart(3, '0');
}

/**
 * Validates if a date is valid
 * @param date - The Date object to validate
 * @returns true if valid, false otherwise
 */
function isValidDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Formats a date to Jira-compatible worklog format
 * 
 * Format: YYYY-MM-DDTHH:mm:ss.SSS+0000
 * Example: 2026-03-02T14:30:45.123+0000
 * 
 * @param optionalDate - Optional date string to parse. If not provided, uses current date.
 * @returns Formatted date string in Jira worklog format
 * @throws Error if the provided date string is invalid
 * 
 * @example
 * // Use current date
 * formatWorklogDate(); // "2026-03-02T14:30:45.123+0000"
 * 
 * @example
 * // Use specific date
 * formatWorklogDate("2026-01-15"); // "2026-01-15T00:00:00.000+0000"
 * 
 * @example
 * // Use ISO date string
 * formatWorklogDate("2026-01-15T10:30:00"); // "2026-01-15T10:30:00.000+0000"
 */
export function formatWorklogDate(optionalDate?: string): string {
  let date: Date;

  if (optionalDate) {
    // Parse the provided date string
    date = new Date(optionalDate);

    // Validate the parsed date
    if (!isValidDate(date)) {
      throw new Error(
        `Invalid date provided: "${optionalDate}"\n` +
        `Expected a valid date string (e.g., "2026-01-15" or "2026-01-15T10:30:00")`
      );
    }
  } else {
    // Use current date if no date provided
    date = new Date();
  }

  // Extract date components in UTC
  const year = date.getUTCFullYear();
  const month = padZero(date.getUTCMonth() + 1); // Months are 0-indexed
  const day = padZero(date.getUTCDate());
  const hours = padZero(date.getUTCHours());
  const minutes = padZero(date.getUTCMinutes());
  const seconds = padZero(date.getUTCSeconds());
  const milliseconds = padMilliseconds(date.getUTCMilliseconds());

  // Format: YYYY-MM-DDTHH:mm:ss.SSS+0000
  // The +0000 indicates UTC timezone (no offset)
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}+0000`;
}

