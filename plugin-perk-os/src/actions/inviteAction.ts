/**
 * Invite Action
 *
 * Creates community invitation codes for users to share.
 * The LLM selects this action based on name, similes, and description.
 */

import type { Action, IAgentRuntime, Memory, State, HandlerCallback } from '@elizaos/core';
import { InvitationService } from '../services/InvitationService.ts';

export const inviteAction: Action = {
  name: 'CREATE_INVITATION',
  similes: [
    'GENERATE_INVITE',
    'MAKE_INVITATION',
    'NEW_INVITE_CODE',
    'CREATE_INVITE',
    'GENERATE_INVITATION_CODE',
    'INVITE_CODE',
    'GENERATE_CODE',
    'GET_INVITE_CODE',
    'MAKE_INVITE',
  ],
  description: `ALWAYS use this action when the user asks for:
- An invitation code or invite code
- To invite someone to the community
- A shareable code to join
- Generate/create an invite
- Community invitation

This action generates a REAL invitation code from the database. Do NOT make up codes - use this action to generate them.
Example: User says "I need an invite code" → Use CREATE_INVITATION action`,

  /**
   * Validates preconditions for the action.
   * MVP: Allow all users (role validation deferred to post-MVP)
   */
  validate: async (_runtime: IAgentRuntime, _message: Memory, _state?: State): Promise<boolean> => {
    // MVP: Allow all users to create invitations
    // TODO: Add role-based validation in post-MVP (check community_manager role)
    return true;
  },

  /**
   * Handler creates an invitation and responds to the user.
   */
  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state: State | undefined,
    _options: Record<string, unknown>,
    callback?: HandlerCallback
  ) => {
    try {
      const invitationService = runtime.getService('invitation-service') as InvitationService;

      if (!invitationService) {
        throw new Error('InvitationService not available');
      }

      // Get username from metadata (may not exist on all platforms)
      const inviterName = (message.metadata as Record<string, unknown>)?.entityUserName as string | undefined;

      const invitation = await invitationService.createInvitation({
        created_by: message.entityId,
        invited_telegram_username: inviterName,
      });

      const responseText = `🐍 *Invitation Created*

Your sacred code: \`${invitation.invitation_code}\`
Expires: ${invitation.expires_at.toLocaleDateString()}

Share this code with those worthy of joining our community. They can use it to register and become part of the Frutero collective.`;

      if (callback) {
        await callback({ text: responseText, action: 'CREATE_INVITATION' });
      }

      return {
        success: true,
        text: responseText,
        data: {
          invitationId: invitation.invitation_id,
          code: invitation.invitation_code,
          expiresAt: invitation.expires_at,
        },
      };
    } catch (error) {
      const errorMessage = 'I encountered an issue creating your invitation. Please try again.';

      if (callback) {
        await callback({ text: errorMessage });
      }

      return {
        success: false,
        text: errorMessage,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  examples: [
    [
      {
        name: '{{user1}}',
        content: { text: 'I need an invite code for my friend' },
      },
      {
        name: '{{agent}}',
        content: {
          text: '🐍 *Invitation Created*\n\nYour sacred code: `ABC123XYZ789`\nExpires: 12/10/2024\n\nShare this code with those worthy of joining our community.',
          action: 'CREATE_INVITATION',
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: { text: 'Can you generate an invitation?' },
      },
      {
        name: '{{agent}}',
        content: {
          text: '🐍 *Invitation Created*\n\nYour sacred code: `DEF456GHI012`\nExpires: 12/10/2024\n\nShare this code with those worthy of joining our community.',
          action: 'CREATE_INVITATION',
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: { text: 'I want to invite someone to join' },
      },
      {
        name: '{{agent}}',
        content: {
          text: '🐍 *Invitation Created*\n\nYour sacred code: `JKL789MNO345`\nExpires: 12/10/2024\n\nShare this code with those worthy of joining our community.',
          action: 'CREATE_INVITATION',
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: { text: 'Generate an invite code for the community' },
      },
      {
        name: '{{agent}}',
        content: {
          text: '🐍 *Invitation Created*\n\nYour sacred code: `MNO456PQR789`\nExpires: 12/10/2024\n\nShare this code with those worthy of joining our community.',
          action: 'CREATE_INVITATION',
        },
      },
    ],
    [
      {
        name: '{{user1}}',
        content: { text: 'Create an invitation code' },
      },
      {
        name: '{{agent}}',
        content: {
          text: '🐍 *Invitation Created*\n\nYour sacred code: `STU123VWX456`\nExpires: 12/10/2024\n\nShare this code with those worthy of joining our community.',
          action: 'CREATE_INVITATION',
        },
      },
    ],
  ],
};

export default inviteAction;
