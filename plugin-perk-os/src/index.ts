/**
 * PerkOS Community Directory Plugin
 *
 * ElizaOS plugin for community member management, invitations, and reputation tracking.
 */

import { perkOsPlugin } from './plugin.ts';

// Plugin exports
export { perkOsPlugin } from './plugin.ts';

// Service exports
export { InvitationService } from './services/InvitationService.ts';
export { InvitationExpirationService } from './services/InvitationExpirationService.ts';

// Action exports
export { inviteAction } from './actions/inviteAction.ts';

// Route exports
export { invitationRoutes } from './routes/invitation.ts';
export { uiRoutes, clearUiCache } from './routes/ui.ts';

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
