/**
 * PerkOS Community Directory Plugin
 *
 * ElizaOS plugin for community member management, invitations, and reputation tracking.
 */

import type { IAgentRuntime, Plugin } from '@elizaos/core';
import { logger } from '@elizaos/core';

// Import Community Directory schema for auto-migration
import { communityDirectorySchema } from './database/schema.ts';

// Import Community Directory services
import { InvitationService } from './services/InvitationService.ts';

// Import Community Directory actions
import { inviteAction } from './actions/inviteAction.ts';

// Import Community Directory routes
import { invitationRoutes } from './routes/invitation.ts';

/**
 * PerkOS Community Directory Plugin
 *
 * Features:
 * - Invitation management with secure code generation
 * - Member registration with GitHub verification
 * - Reputation scoring based on GitHub activity
 * - Participation tracking across platforms
 */
export const perkOsPlugin: Plugin = {
  name: 'plugin-perk-os',
  description:
    'PerkOS Community Directory Plugin - Member management, invitations, and reputation tracking',

  // Database schema for ElizaOS auto-migration
  schema: communityDirectorySchema,

  // Plugin initialization
  async init(_config: Record<string, string>, _runtime: IAgentRuntime) {
    logger.info('[plugin-perk-os] Initializing Community Directory plugin');
  },

  // Services
  services: [InvitationService],

  // Actions
  actions: [inviteAction],

  // Providers (will be added as needed)
  providers: [],

  // Routes for invitation management (CD-105)
  routes: invitationRoutes,
};

export default perkOsPlugin;
