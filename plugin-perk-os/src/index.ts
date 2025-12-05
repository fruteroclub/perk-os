/**
 * PerkOS Community Directory Plugin
 *
 * ElizaOS plugin for community member management, invitations, and reputation tracking.
 */

import { perkOsPlugin } from './plugin.ts';

// Plugin exports
export { perkOsPlugin, StarterService } from './plugin.ts';

// Backwards compatibility
export { starterPlugin } from './plugin.ts';

// Type exports
export * from './types/index.ts';

// Schema exports (for direct database access if needed)
export { communityDirectorySchema } from './database/schema.ts';
export {
  communityInvitations,
  communityMembers,
  memberRelationships,
  memberParticipation,
  memberDailyHighlights,
} from './database/schema.ts';

// Default export
export default perkOsPlugin;
