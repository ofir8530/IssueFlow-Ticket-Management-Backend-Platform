/** Matches @username tokens (letters, digits, underscore). */
const MENTION_PATTERN = /@([a-zA-Z0-9_]+)/g;

/**
 * Returns unique usernames mentioned in comment content (without the @ prefix).
 * Example: "Hello @jdoe and @asmith" → ["jdoe", "asmith"]
 */
export function extractMentionedUsernames(content: string): string[] {
  const matches = content.matchAll(MENTION_PATTERN);
  return [...new Set([...matches].map((match) => match[1]))];
}

/** Alias used by CommentsService. */
export const extractMentions = extractMentionedUsernames;
