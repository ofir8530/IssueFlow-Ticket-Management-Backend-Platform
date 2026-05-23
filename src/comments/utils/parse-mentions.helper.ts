const MENTION_PATTERN = /@([a-zA-Z0-9_]+)/g;

export function extractMentionedUsernames(content: string): string[] {
  const matches = content.matchAll(MENTION_PATTERN);
  return [...new Set([...matches].map((match) => match[1]))];
}
