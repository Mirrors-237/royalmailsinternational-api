import { randomInt } from 'node:crypto';

// Generates a secure, readable tracking number
// Format: {PREFIX}{N chars} (e.g. TAC9XJ4KL2MNP)
// Total length controlled by TRACKING_CODE_LENGTH (default: 13)
// Excludes ambiguous characters: 0, O, 1, I, L
const CHARSET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

// Cryptographic randomness: with Math.random, a bot that sees a few tracking numbers
// could work out the next ones and read other customers' shipments
function randomSegment(length: number): string {
  return Array.from({ length }, () => CHARSET[randomInt(CHARSET.length)]).join('');
}

export function generateTrackingId(prefix = 'TAC'): string {
  const totalLength = parseInt(process.env.TRACKING_CODE_LENGTH ?? '13', 10) || 13;
  const randomLength = Math.max(1, totalLength - prefix.length);
  return `${prefix.toUpperCase()}${randomSegment(randomLength)}`;
}
