
export interface UserStats {
  rank: number;
  username: string;
  displayName?: string;
  identityType?: 'ENS' | 'FNAME' | 'NONE';
  baseAppAgeDays: number;
  twitterAgeDays: number;
  tweetCount: number;
  lamboLessBalance: number;
  walletConnected: boolean;
  twitterConnected: boolean;
  farcasterConnected: boolean;
}

export interface ScoreBreakdown {
  baseAppPoints: number;
  twitterAgePoints: number;
  contributionPoints: number;
  totalScore: number;
}

export interface ClaimRecord {
  tier: BadgeTier;
  rank: number;
  timestamp: string;
  id: string;
}

export enum BadgeTier {
  PLATINUM = 'PLATINUM',
  GOLD = 'GOLD',
  SILVER = 'SILVER',
  BRONZE = 'BRONZE',
  NONE = 'NONE'
}

export const SNAPSHOT_START = new Date('2025-11-01T00:01:00Z');
export const SNAPSHOT_END = new Date('2026-01-15T23:49:00Z');
export const SNAPSHOT_FREEZE = new Date('2026-01-16T00:01:00Z');
export const CLAIM_START = new Date('2026-01-16T00:05:00Z');
export const CLAIM_END = new Date('2026-01-31T23:59:00Z');

export const LAMBOLESS_CONTRACT = "0xbe7c48aad42eea060150cb64f94b6448a89c1cef";
