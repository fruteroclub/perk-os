/**
 * Invitation Routes Unit Tests
 *
 * Tests for the invitation API routes.
 */

import { describe, expect, it, beforeEach, mock } from 'bun:test';
import {
  listInvitationsRoute,
  createInvitationRoute,
  cancelInvitationRoute,
  getInvitationRoute,
  getInvitationStatsRoute,
} from '../routes/invitation';
import { createMockRuntime, createUUID } from './test-utils';
import type { IAgentRuntime } from '@elizaos/core';

// Mock invitation data
const mockInvitation = {
  invitation_id: createUUID(),
  invitation_code: 'TEST1234ABCD5678',
  created_by: createUUID(),
  invited_telegram_username: 'testuser',
  status: 'pending' as const,
  expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  accepted_by: undefined,
  accepted_at: undefined,
  created_at: new Date(),
  updated_at: new Date(),
};

describe('invitationRoutes', () => {
  let runtime: IAgentRuntime;
  let mockInvitationService: any;
  let mockRes: any;
  let responseData: any;
  let statusCode: number;

  beforeEach(() => {
    responseData = null;
    statusCode = 200;

    mockRes = {
      json: (data: any) => {
        responseData = data;
      },
      status: (code: number) => {
        statusCode = code;
        return mockRes;
      },
    };

    mockInvitationService = {
      listInvitations: mock().mockResolvedValue([mockInvitation]),
      createInvitation: mock().mockResolvedValue(mockInvitation),
      getInvitationById: mock().mockResolvedValue(mockInvitation),
      cancelInvitation: mock().mockResolvedValue({ ...mockInvitation, status: 'cancelled' }),
      getInvitationStats: mock().mockResolvedValue({
        pending: 5,
        accepted: 10,
        expired: 2,
        cancelled: 1,
      }),
    };

    runtime = createMockRuntime({
      getService: mock().mockImplementation((serviceType: string) => {
        if (serviceType === 'invitation-service') {
          return mockInvitationService;
        }
        return null;
      }),
    });
  });

  describe('GET /api/invitations (listInvitationsRoute)', () => {
    it('should have correct route metadata', () => {
      expect(listInvitationsRoute.name).toBe('list-invitations');
      expect(listInvitationsRoute.path).toBe('/invitations');
      expect(listInvitationsRoute.type).toBe('GET');
    });

    it('should return invitations list', async () => {
      const mockReq = { query: { userId: createUUID() } };

      await listInvitationsRoute.handler!(mockReq, mockRes, runtime);

      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveLength(1);
      expect(responseData.data[0].code).toBe('TEST1234ABCD5678');
    });

    it('should filter by status', async () => {
      const mockReq = { query: { userId: createUUID(), status: 'pending' } };

      await listInvitationsRoute.handler!(mockReq, mockRes, runtime);

      expect(mockInvitationService.listInvitations).toHaveBeenCalledWith(
        mockReq.query.userId,
        'pending'
      );
    });

    it('should handle missing service', async () => {
      runtime = createMockRuntime({
        getService: mock().mockReturnValue(null),
      });

      const mockReq = { query: {} };

      await listInvitationsRoute.handler!(mockReq, mockRes, runtime);

      expect(statusCode).toBe(500);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('Invitation service not available');
    });
  });

  describe('POST /api/invitations (createInvitationRoute)', () => {
    it('should have correct route metadata', () => {
      expect(createInvitationRoute.name).toBe('create-invitation');
      expect(createInvitationRoute.path).toBe('/invitations');
      expect(createInvitationRoute.type).toBe('POST');
    });

    it('should create invitation successfully', async () => {
      const userId = createUUID();
      const mockReq = { body: { userId } };

      await createInvitationRoute.handler!(mockReq, mockRes, runtime);

      expect(statusCode).toBe(201);
      expect(responseData.success).toBe(true);
      expect(responseData.data.code).toBe('TEST1234ABCD5678');
    });

    it('should pass optional parameters', async () => {
      const userId = createUUID();
      const mockReq = {
        body: {
          userId,
          invitedUsername: 'newuser',
          expiresInDays: 7,
        },
      };

      await createInvitationRoute.handler!(mockReq, mockRes, runtime);

      expect(mockInvitationService.createInvitation).toHaveBeenCalledWith({
        created_by: userId,
        invited_telegram_username: 'newuser',
        expires_in_days: 7,
      });
    });

    it('should return 400 if userId is missing', async () => {
      const mockReq = { body: {} };

      await createInvitationRoute.handler!(mockReq, mockRes, runtime);

      expect(statusCode).toBe(400);
      expect(responseData.success).toBe(false);
      expect(responseData.error).toBe('userId is required');
    });

    it('should handle service errors', async () => {
      mockInvitationService.createInvitation = mock().mockRejectedValue(
        new Error('Database error')
      );

      const mockReq = { body: { userId: createUUID() } };

      await createInvitationRoute.handler!(mockReq, mockRes, runtime);

      expect(statusCode).toBe(500);
      expect(responseData.success).toBe(false);
    });
  });

  describe('DELETE /api/invitations/:id (cancelInvitationRoute)', () => {
    it('should have correct route metadata', () => {
      expect(cancelInvitationRoute.name).toBe('cancel-invitation');
      expect(cancelInvitationRoute.path).toBe('/invitations/:id');
      expect(cancelInvitationRoute.type).toBe('DELETE');
    });

    it('should cancel invitation successfully', async () => {
      const mockReq = { params: { id: mockInvitation.invitation_id } };

      await cancelInvitationRoute.handler!(mockReq, mockRes, runtime);

      expect(responseData.success).toBe(true);
      expect(responseData.data.status).toBe('cancelled');
    });

    it('should return 400 if id is missing', async () => {
      const mockReq = { params: {} };

      await cancelInvitationRoute.handler!(mockReq, mockRes, runtime);

      expect(statusCode).toBe(400);
      expect(responseData.error).toBe('Invitation ID is required');
    });

    it('should return 404 if invitation not found', async () => {
      mockInvitationService.getInvitationById = mock().mockResolvedValue(null);

      const mockReq = { params: { id: createUUID() } };

      await cancelInvitationRoute.handler!(mockReq, mockRes, runtime);

      expect(statusCode).toBe(404);
      expect(responseData.error).toBe('Invitation not found');
    });

    it('should return 400 if invitation cannot be cancelled', async () => {
      mockInvitationService.cancelInvitation = mock().mockRejectedValue(
        new Error('Cannot cancel invitation: status is accepted')
      );

      const mockReq = { params: { id: mockInvitation.invitation_id } };

      await cancelInvitationRoute.handler!(mockReq, mockRes, runtime);

      expect(statusCode).toBe(400);
      expect(responseData.error).toContain('Cannot cancel');
    });
  });

  describe('GET /api/invitations/:id (getInvitationRoute)', () => {
    it('should have correct route metadata', () => {
      expect(getInvitationRoute.name).toBe('get-invitation');
      expect(getInvitationRoute.path).toBe('/invitations/:id');
      expect(getInvitationRoute.type).toBe('GET');
    });

    it('should return single invitation', async () => {
      const mockReq = { params: { id: mockInvitation.invitation_id } };

      await getInvitationRoute.handler!(mockReq, mockRes, runtime);

      expect(responseData.success).toBe(true);
      expect(responseData.data.id).toBe(mockInvitation.invitation_id);
    });

    it('should return 404 if not found', async () => {
      mockInvitationService.getInvitationById = mock().mockResolvedValue(null);

      const mockReq = { params: { id: createUUID() } };

      await getInvitationRoute.handler!(mockReq, mockRes, runtime);

      expect(statusCode).toBe(404);
      expect(responseData.error).toBe('Invitation not found');
    });
  });

  describe('GET /api/invitations/stats (getInvitationStatsRoute)', () => {
    it('should have correct route metadata', () => {
      expect(getInvitationStatsRoute.name).toBe('invitation-stats');
      expect(getInvitationStatsRoute.path).toBe('/invitations/stats');
      expect(getInvitationStatsRoute.type).toBe('GET');
    });

    it('should return stats for user', async () => {
      const userId = createUUID();
      const mockReq = { query: { userId } };

      await getInvitationStatsRoute.handler!(mockReq, mockRes, runtime);

      expect(responseData.success).toBe(true);
      expect(responseData.data.pending).toBe(5);
      expect(responseData.data.accepted).toBe(10);
    });

    it('should return 400 if userId is missing', async () => {
      const mockReq = { query: {} };

      await getInvitationStatsRoute.handler!(mockReq, mockRes, runtime);

      expect(statusCode).toBe(400);
      expect(responseData.error).toBe('userId is required');
    });
  });
});
