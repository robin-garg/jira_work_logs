const TIME_SEGMENT_REGEX = /(\d+)\s*([hm])/gi;

export function parseTimeToSeconds(input: string): number {
  const normalizedInput = input.trim();

  if (!normalizedInput) {
    throw new Error('timeSpent is required');
  }

  let totalSeconds = 0;
  let match: RegExpExecArray | null;

  while ((match = TIME_SEGMENT_REGEX.exec(normalizedInput)) !== null) {
    const value = Number(match[1]);
    const unit = match[2].toLowerCase();

    totalSeconds += unit === 'h' ? value * 3600 : value * 60;
  }

  const remainingText = normalizedInput.replace(TIME_SEGMENT_REGEX, '').replace(/\s+/g, '');

  if (totalSeconds <= 0 || remainingText.length > 0) {
    throw new Error('Invalid timeSpent format. Use values like "2h", "1h 30m", or "45m".');
  }

  return totalSeconds;
}
