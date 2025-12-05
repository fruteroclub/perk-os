/**
 * Community Directory Database Schema
 *
 * Drizzle ORM schema definitions for the Community Directory plugin.
 * ElizaOS will automatically handle migrations from these schema definitions.
 *
 * Tables:
 * - community_invitations: Invitation codes, status, expiry
 * - community_members: Member profiles with GitHub verification
 * - member_relationships: ElizaOS Memory integration (JSONB)
 * - member_participation: Engagement tracking
 * - member_daily_highlights: Daily activity summaries
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  date,
  boolean,
  integer,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';

// ============================================================================
// community_invitations
// ============================================================================
// Manages invitation codes for member registration
// Status: pending | accepted | expired | cancelled

export const communityInvitations = pgTable(
  'community_invitations',
  {
    invitation_id: uuid('invitation_id').primaryKey().defaultRandom(),
    invitation_code: varchar('invitation_code', { length: 16 }).unique().notNull(),
    created_by: varchar('created_by', { length: 20 }).notNull(), // member_id of inviter
    invited_telegram_username: varchar('invited_telegram_username', { length: 255 }),
    status: varchar('status', { length: 20 }).default('pending').notNull(),
    expires_at: timestamp('expires_at').notNull(),
    accepted_by: varchar('accepted_by', { length: 20 }), // member_id of acceptor
    accepted_at: timestamp('accepted_at'),
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('invitation_code_idx').on(table.invitation_code),
    index('invitation_status_idx').on(table.status),
    index('invitation_created_by_idx').on(table.created_by),
    index('invitation_expires_at_idx').on(table.expires_at),
  ]
);

// ============================================================================
// community_members
// ============================================================================
// Core member profiles with GitHub verification and reputation tracking
// Status: not_member | pending | active | suspended | banned

export const communityMembers = pgTable(
  'community_members',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    member_id: varchar('member_id', { length: 20 }).unique().notNull(), // Human-readable like #247

    // Telegram identity
    telegram_id: varchar('telegram_id', { length: 255 }).unique().notNull(),
    telegram_username: varchar('telegram_username', { length: 255 }),

    // Profile data
    name: varchar('name', { length: 255 }).notNull(),
    primary_role: varchar('primary_role', { length: 50 }).notNull(), // student, developer, designer, etc.
    organization: varchar('organization', { length: 255 }),
    country: varchar('country', { length: 100 }),

    // GitHub verification (MVP focus)
    github_username: varchar('github_username', { length: 255 }),
    github_verified: boolean('github_verified').default(false).notNull(),
    github_verified_at: timestamp('github_verified_at'),
    github_profile_data: jsonb('github_profile_data'), // Store GitHub API response

    // Status and reputation
    status: varchar('status', { length: 20 }).default('not_member').notNull(),
    reputation_score: integer('reputation_score').default(0).notNull(),
    reputation_tier: varchar('reputation_tier', { length: 50 }).default('Novice'),

    // Invitation tracking
    invited_by: varchar('invited_by', { length: 20 }), // member_id of inviter

    // Registration fee (post-MVP)
    registration_fee_paid: boolean('registration_fee_paid').default(false),
    registration_fee_tx_hash: varchar('registration_fee_tx_hash', { length: 255 }),

    // Flexible profile data
    profile_data: jsonb('profile_data'),

    // Timestamps
    created_at: timestamp('created_at').defaultNow().notNull(),
    updated_at: timestamp('updated_at').defaultNow().notNull(),
    last_active_at: timestamp('last_active_at'),
    deleted_at: timestamp('deleted_at'), // Soft delete
  },
  (table) => [
    index('member_telegram_id_idx').on(table.telegram_id),
    index('member_telegram_username_idx').on(table.telegram_username),
    index('member_github_username_idx').on(table.github_username),
    index('member_status_idx').on(table.status),
    index('member_reputation_score_idx').on(table.reputation_score),
    index('member_primary_role_idx').on(table.primary_role),
  ]
);

// ============================================================================
// member_relationships
// ============================================================================
// Stores relationships between entities (for ElizaOS Memory integration)
// Used for: invitations, mentorship, collaborations, etc.

export const memberRelationships = pgTable(
  'member_relationships',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    entity_id_a: varchar('entity_id_a', { length: 255 }).notNull(), // ElizaOS entity ID
    entity_id_b: varchar('entity_id_b', { length: 255 }).notNull(), // ElizaOS entity ID
    relationship_type: varchar('relationship_type', { length: 50 }).notNull(), // INVITED, MENTORED, etc.
    content: jsonb('content').notNull(), // Flexible relationship metadata
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('relationship_entity_a_idx').on(table.entity_id_a),
    index('relationship_entity_b_idx').on(table.entity_id_b),
    index('relationship_type_idx').on(table.relationship_type),
  ]
);

// ============================================================================
// member_participation
// ============================================================================
// Tracks member engagement events (messages, reactions, voice, etc.)

export const memberParticipation = pgTable(
  'member_participation',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    member_id: varchar('member_id', { length: 20 }).notNull(),
    event_type: varchar('event_type', { length: 50 }).notNull(), // MESSAGE, REACTION, VOICE, ACTION
    platform: varchar('platform', { length: 50 }).notNull(), // telegram, discord, etc.
    room_id: varchar('room_id', { length: 255 }).notNull(),
    event_metadata: jsonb('event_metadata'), // Flexible event data
    occurred_at: timestamp('occurred_at').defaultNow().notNull(),
  },
  (table) => [
    index('participation_member_id_idx').on(table.member_id),
    index('participation_event_type_idx').on(table.event_type),
    index('participation_platform_idx').on(table.platform),
    index('participation_occurred_at_idx').on(table.occurred_at),
  ]
);

// ============================================================================
// member_daily_highlights
// ============================================================================
// Aggregated daily activity summaries for analytics and reputation

export const memberDailyHighlights = pgTable(
  'member_daily_highlights',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    member_id: varchar('member_id', { length: 20 }).notNull(),
    highlight_date: date('highlight_date').notNull(),
    message_count: integer('message_count').default(0),
    reaction_count: integer('reaction_count').default(0),
    voice_minutes: integer('voice_minutes').default(0),
    reputation_earned: integer('reputation_earned').default(0),
    created_at: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [index('highlight_member_date_idx').on(table.member_id, table.highlight_date)]
);

// ============================================================================
// Schema Export
// ============================================================================
// Export all tables as a single schema object for ElizaOS auto-migration

export const communityDirectorySchema = {
  communityInvitations,
  communityMembers,
  memberRelationships,
  memberParticipation,
  memberDailyHighlights,
};

export default communityDirectorySchema;
