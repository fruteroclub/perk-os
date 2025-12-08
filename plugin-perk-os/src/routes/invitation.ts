/**
 * Invitation API Routes
 *
 * REST API endpoints for invitation management.
 * - GET /api/invitations - List invitations for current user
 * - POST /api/invitations - Create new invitation
 * - DELETE /api/invitations/:id - Cancel invitation
 */

import type { Route, IAgentRuntime } from '@elizaos/core';
import { logger } from '@elizaos/core';
import { InvitationService } from '../services/InvitationService.ts';
import type { CommunityInvitation, InvitationStatus } from '../types/index.ts';

/**
 * GET /api/invitations
 * List invitations for the authenticated user
 *
 * Query params:
 * - status: Filter by status (pending, accepted, expired, cancelled)
 * - userId: User ID to filter by (for MVP, accepts any userId)
 */
export const listInvitationsRoute: Route = {
  name: 'list-invitations',
  path: '/invitations',
  type: 'GET',
  public: false,
  handler: async (req: any, res: any, runtime: IAgentRuntime) => {
    try {
      const invitationService = runtime.getService('invitation-service') as InvitationService;

      if (!invitationService) {
        logger.error('[invitation-routes] InvitationService not available');
        return res.status(500).json({
          success: false,
          error: 'Invitation service not available',
        });
      }

      // Get query parameters
      const userId = req.query?.userId as string | undefined;
      const status = req.query?.status as InvitationStatus | undefined;

      // MVP: Allow listing without strict auth (userId can be provided)
      // Post-MVP: Validate user from session/token
      const invitations = await invitationService.listInvitations(userId, status);

      res.json({
        success: true,
        data: invitations.map(formatInvitationResponse),
        total: invitations.length,
      });
    } catch (error) {
      logger.error('[invitation-routes] Error listing invitations:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to list invitations',
      });
    }
  },
};

/**
 * POST /api/invitations
 * Create a new invitation
 *
 * Body:
 * - userId: Creator's user ID (required)
 * - invitedUsername: Optional telegram username being invited
 * - expiresInDays: Optional, defaults to 3 days
 */
export const createInvitationRoute: Route = {
  name: 'create-invitation',
  path: '/invitations',
  type: 'POST',
  public: false,
  handler: async (req: any, res: any, runtime: IAgentRuntime) => {
    try {
      const invitationService = runtime.getService('invitation-service') as InvitationService;

      if (!invitationService) {
        logger.error('[invitation-routes] InvitationService not available');
        return res.status(500).json({
          success: false,
          error: 'Invitation service not available',
        });
      }

      const { userId, invitedUsername, expiresInDays } = req.body || {};

      // Validate required fields
      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId is required',
        });
      }

      // MVP: No role validation (deferred to post-MVP)
      // Post-MVP: Check if user has community_manager role

      const invitation = await invitationService.createInvitation({
        created_by: userId,
        invited_telegram_username: invitedUsername,
        expires_in_days: expiresInDays,
      });

      logger.info(`[invitation-routes] Created invitation ${invitation.invitation_code} by ${userId}`);

      res.status(201).json({
        success: true,
        data: formatInvitationResponse(invitation),
      });
    } catch (error) {
      logger.error('[invitation-routes] Error creating invitation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create invitation',
      });
    }
  },
};

/**
 * DELETE /api/invitations/:id
 * Cancel an invitation
 *
 * Params:
 * - id: Invitation ID (UUID)
 */
export const cancelInvitationRoute: Route = {
  name: 'cancel-invitation',
  path: '/invitations/:id',
  type: 'DELETE',
  public: false,
  handler: async (req: any, res: any, runtime: IAgentRuntime) => {
    try {
      const invitationService = runtime.getService('invitation-service') as InvitationService;

      if (!invitationService) {
        logger.error('[invitation-routes] InvitationService not available');
        return res.status(500).json({
          success: false,
          error: 'Invitation service not available',
        });
      }

      const invitationId = req.params?.id;

      if (!invitationId) {
        return res.status(400).json({
          success: false,
          error: 'Invitation ID is required',
        });
      }

      // Check if invitation exists
      const existing = await invitationService.getInvitationById(invitationId);
      if (!existing) {
        return res.status(404).json({
          success: false,
          error: 'Invitation not found',
        });
      }

      // MVP: No ownership validation
      // Post-MVP: Verify user owns this invitation or is admin

      const cancelled = await invitationService.cancelInvitation(invitationId);

      logger.info(`[invitation-routes] Cancelled invitation ${invitationId}`);

      res.json({
        success: true,
        data: formatInvitationResponse(cancelled),
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Handle specific error cases
      if (errorMessage.includes('Cannot cancel')) {
        return res.status(400).json({
          success: false,
          error: errorMessage,
        });
      }

      logger.error('[invitation-routes] Error cancelling invitation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel invitation',
      });
    }
  },
};

/**
 * GET /api/invitations/:id
 * Get a single invitation by ID
 */
export const getInvitationRoute: Route = {
  name: 'get-invitation',
  path: '/invitations/:id',
  type: 'GET',
  public: false,
  handler: async (req: any, res: any, runtime: IAgentRuntime) => {
    try {
      const invitationService = runtime.getService('invitation-service') as InvitationService;

      if (!invitationService) {
        logger.error('[invitation-routes] InvitationService not available');
        return res.status(500).json({
          success: false,
          error: 'Invitation service not available',
        });
      }

      const invitationId = req.params?.id;

      if (!invitationId) {
        return res.status(400).json({
          success: false,
          error: 'Invitation ID is required',
        });
      }

      const invitation = await invitationService.getInvitationById(invitationId);

      if (!invitation) {
        return res.status(404).json({
          success: false,
          error: 'Invitation not found',
        });
      }

      res.json({
        success: true,
        data: formatInvitationResponse(invitation),
      });
    } catch (error) {
      logger.error('[invitation-routes] Error getting invitation:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get invitation',
      });
    }
  },
};

/**
 * GET /api/invitations/stats
 * Get invitation statistics for a user
 */
export const getInvitationStatsRoute: Route = {
  name: 'invitation-stats',
  path: '/invitations/stats',
  type: 'GET',
  public: false,
  handler: async (req: any, res: any, runtime: IAgentRuntime) => {
    try {
      const invitationService = runtime.getService('invitation-service') as InvitationService;

      if (!invitationService) {
        logger.error('[invitation-routes] InvitationService not available');
        return res.status(500).json({
          success: false,
          error: 'Invitation service not available',
        });
      }

      const userId = req.query?.userId as string | undefined;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'userId is required',
        });
      }

      const stats = await invitationService.getInvitationStats(userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      logger.error('[invitation-routes] Error getting invitation stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get invitation stats',
      });
    }
  },
};

/**
 * Format invitation for API response
 */
function formatInvitationResponse(invitation: CommunityInvitation) {
  return {
    id: invitation.invitation_id,
    code: invitation.invitation_code,
    status: invitation.status,
    createdBy: invitation.created_by,
    invitedUsername: invitation.invited_telegram_username,
    expiresAt: invitation.expires_at.toISOString(),
    acceptedBy: invitation.accepted_by,
    acceptedAt: invitation.accepted_at?.toISOString(),
    createdAt: invitation.created_at.toISOString(),
    updatedAt: invitation.updated_at.toISOString(),
  };
}

/**
 * All invitation routes
 */
export const invitationRoutes: Route[] = [
  getInvitationStatsRoute, // Must come before :id route
  listInvitationsRoute,
  createInvitationRoute,
  getInvitationRoute,
  cancelInvitationRoute,
];

export default invitationRoutes;
