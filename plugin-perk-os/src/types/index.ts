/**
 * Community Directory TypeScript Types
 *
 * Domain types and interfaces for the Community Directory plugin.
 * These types map to the Drizzle schema in database/schema.ts
 */

// ============================================================================
// Status Enums
// ============================================================================

/**
 * Invitation status lifecycle
 */
export type InvitationStatus = 'pending' | 'accepted' | 'expired' | 'cancelled';

/**
 * Member status lifecycle
 * - not_member: Default for Extended Community
 * - pending: Registered, awaiting activation
 * - active: Full member access
 * - suspended: Temporarily restricted
 * - banned: Permanently removed
 */
export type MemberStatus = 'not_member' | 'pending' | 'active' | 'suspended' | 'banned';

/**
 * Reputation tiers based on GitHub activity score
 * - Novice: 0-100 points
 * - Contributor: 101-500 points
 * - Active Developer: 501-1,000 points
 * - Experienced: 1,001-2,500 points
 * - Expert: 2,501+ points
 */
export type ReputationTier = 'Novice' | 'Contributor' | 'Active Developer' | 'Experienced' | 'Expert';

/**
 * Primary roles for community members
 */
export type MemberRole =
  | 'student'
  | 'developer'
  | 'designer'
  | 'researcher'
  | 'founder'
  | 'investor'
  | 'community_manager'
  | 'content_creator'
  | 'other';

/**
 * Participation event types
 */
export type ParticipationEventType = 'MESSAGE' | 'REACTION' | 'VOICE' | 'ACTION' | 'JOIN' | 'LEAVE';

/**
 * Supported platforms
 */
export type Platform = 'telegram' | 'discord' | 'twitch' | 'kick' | 'github';

/**
 * Relationship types for member_relationships
 */
export type RelationshipType = 'INVITED' | 'MENTORED' | 'COLLABORATED' | 'REFERRED';

// ============================================================================
// Domain Interfaces
// ============================================================================

/**
 * Community Invitation
 */
export interface CommunityInvitation {
  invitation_id: string;
  invitation_code: string;
  created_by: string; // member_id
  invited_telegram_username?: string;
  status: InvitationStatus;
  expires_at: Date;
  accepted_by?: string; // member_id
  accepted_at?: Date;
  created_at: Date;
  updated_at: Date;
}

/**
 * GitHub profile data stored in JSONB
 */
export interface GitHubProfileData {
  login: string;
  id: number;
  avatar_url?: string;
  html_url: string;
  name?: string;
  company?: string;
  blog?: string;
  location?: string;
  bio?: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  // Computed metrics for reputation
  total_stars?: number;
  contributions_last_year?: number;
}

/**
 * Additional profile data stored in JSONB
 */
export interface ProfileData {
  bio?: string;
  skills?: string[];
  interests?: string[];
  website?: string;
  linkedin?: string;
  twitter?: string;
  discord_username?: string;
  twitch_username?: string;
  kick_username?: string;
}

/**
 * Community Member
 */
export interface CommunityMember {
  id: string;
  member_id: string; // Human-readable like #247

  // Telegram identity
  telegram_id: string;
  telegram_username?: string;

  // Profile
  name: string;
  primary_role: MemberRole;
  organization?: string;
  country?: string;

  // GitHub verification
  github_username?: string;
  github_verified: boolean;
  github_verified_at?: Date;
  github_profile_data?: GitHubProfileData;

  // Status and reputation
  status: MemberStatus;
  reputation_score: number;
  reputation_tier: ReputationTier;

  // Invitation tracking
  invited_by?: string; // member_id

  // Registration fee
  registration_fee_paid: boolean;
  registration_fee_tx_hash?: string;

  // Additional profile
  profile_data?: ProfileData;

  // Timestamps
  created_at: Date;
  updated_at: Date;
  last_active_at?: Date;
  deleted_at?: Date;
}

/**
 * Member Relationship (for ElizaOS Memory integration)
 */
export interface MemberRelationship {
  id: string;
  entity_id_a: string;
  entity_id_b: string;
  relationship_type: RelationshipType;
  content: Record<string, unknown>;
  created_at: Date;
}

/**
 * Event metadata for participation tracking
 */
export interface ParticipationEventMetadata {
  message_id?: string;
  message_text?: string;
  reaction_emoji?: string;
  voice_duration_seconds?: number;
  action_type?: string;
  context?: string;
}

/**
 * Member Participation Event
 */
export interface MemberParticipation {
  id: string;
  member_id: string;
  event_type: ParticipationEventType;
  platform: Platform;
  room_id: string;
  event_metadata?: ParticipationEventMetadata;
  occurred_at: Date;
}

/**
 * Member Daily Highlight (aggregated metrics)
 */
export interface MemberDailyHighlight {
  id: string;
  member_id: string;
  highlight_date: string; // YYYY-MM-DD format
  message_count: number;
  reaction_count: number;
  voice_minutes: number;
  reputation_earned: number;
  created_at: Date;
}

// ============================================================================
// Input/Output Types for Actions and Services
// ============================================================================

/**
 * Input for creating an invitation
 */
export interface CreateInvitationInput {
  created_by: string;
  invited_telegram_username?: string;
  expires_in_days?: number; // Default: 3 days
}

/**
 * Input for member registration
 */
export interface RegisterMemberInput {
  invitation_code: string;
  telegram_id: string;
  telegram_username?: string;
  name: string;
  primary_role: MemberRole;
  organization?: string;
  country?: string;
  github_username: string; // Required in MVP
}

/**
 * Directory filter options
 */
export interface DirectoryFilterOptions {
  search?: string; // Search name, username, organization
  role?: MemberRole;
  status?: MemberStatus;
  min_reputation?: number;
  max_reputation?: number;
  github_verified?: boolean;
  page?: number;
  limit?: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// ============================================================================
// Reputation Calculation Types
// ============================================================================

/**
 * GitHub metrics for reputation calculation
 */
export interface GitHubMetrics {
  public_repos: number;
  followers: number;
  total_stars: number;
  contributions_last_year: number;
}

/**
 * Reputation calculation result
 */
export interface ReputationCalculation {
  score: number;
  tier: ReputationTier;
  breakdown: {
    repos: number;
    followers: number;
    stars: number;
    contributions: number;
  };
}

/**
 * Calculate reputation tier from score
 */
export function getReputationTier(score: number): ReputationTier {
  if (score <= 100) return 'Novice';
  if (score <= 500) return 'Contributor';
  if (score <= 1000) return 'Active Developer';
  if (score <= 2500) return 'Experienced';
  return 'Expert';
}

/**
 * Calculate reputation score from GitHub metrics
 * Formula: (public_repos × 5) + (followers × 3) + (total_stars × 2) + (contributions × 1)
 */
export function calculateReputationScore(metrics: GitHubMetrics): ReputationCalculation {
  const breakdown = {
    repos: metrics.public_repos * 5,
    followers: metrics.followers * 3,
    stars: metrics.total_stars * 2,
    contributions: metrics.contributions_last_year * 1,
  };

  const score = breakdown.repos + breakdown.followers + breakdown.stars + breakdown.contributions;
  const tier = getReputationTier(score);

  return { score, tier, breakdown };
}
