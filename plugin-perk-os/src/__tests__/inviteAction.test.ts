/**
 * InviteAction Unit Tests
 *
 * Tests for the CREATE_INVITATION action.
 */

import { describe, expect, it, beforeEach, mock, spyOn } from 'bun:test';
import { inviteAction } from '../actions/inviteAction';
import { InvitationService } from '../services/InvitationService';
import { createMockRuntime, createTestMemory, createTestState, createUUID } from './test-utils';
import type { IAgentRuntime, Memory, State, HandlerCallback } from '@elizaos/core';

describe('inviteAction', () => {
  describe('metadata', () => {
    it('should have correct name', () => {
      expect(inviteAction.name).toBe('CREATE_INVITATION');
    });

    it('should have similes for LLM action selection', () => {
      expect(inviteAction.similes).toContain('GENERATE_INVITE');
      expect(inviteAction.similes).toContain('MAKE_INVITATION');
      expect(inviteAction.similes).toContain('NEW_INVITE_CODE');
    });

    it('should have a description for LLM intent recognition', () => {
      expect(inviteAction.description).toContain('invitation code');
      expect(inviteAction.description).toContain('community');
    });

    it('should have examples for LLM training', () => {
      expect(inviteAction.examples).toBeDefined();
      expect(inviteAction.examples?.length).toBeGreaterThan(0);
    });
  });

  describe('validate()', () => {
    let runtime: IAgentRuntime;
    let message: Memory;

    beforeEach(() => {
      runtime = createMockRuntime();
      message = createTestMemory();
    });

    it('should return true for MVP (no role restrictions)', async () => {
      const result = await inviteAction.validate(runtime, message);
      expect(result).toBe(true);
    });

    it('should return true for any message content', async () => {
      message = createTestMemory({
        content: { text: 'random unrelated message', source: 'telegram' },
      });
      const result = await inviteAction.validate(runtime, message);
      expect(result).toBe(true);
    });

    it('should return true regardless of user metadata', async () => {
      message = createTestMemory({
        metadata: { entityUserName: 'newuser', role: 'student' },
      });
      const result = await inviteAction.validate(runtime, message);
      expect(result).toBe(true);
    });
  });

  describe('handler()', () => {
    let runtime: IAgentRuntime;
    let message: Memory;
    let state: State;
    let callback: ReturnType<typeof mock>;
    let mockInvitationService: Partial<InvitationService>;

    beforeEach(() => {
      // Create mock invitation service
      mockInvitationService = {
        createInvitation: mock().mockResolvedValue({
          invitation_id: createUUID(),
          invitation_code: 'TEST1234ABCD5678',
          expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
          status: 'pending',
          created_at: new Date(),
        }),
      };

      // Create runtime with service
      runtime = createMockRuntime({
        getService: mock().mockImplementation((serviceType: string) => {
          if (serviceType === 'invitation-service') {
            return mockInvitationService as InvitationService;
          }
          return null;
        }),
      });

      message = createTestMemory({
        entityId: createUUID(),
        metadata: { entityUserName: 'testuser' },
        content: { text: 'I need an invite code', source: 'telegram' },
      });

      state = createTestState();
      callback = mock();
    });

    it('should call InvitationService.createInvitation()', async () => {
      await inviteAction.handler(runtime, message, state, {}, callback);

      expect(mockInvitationService.createInvitation).toHaveBeenCalled();
    });

    it('should pass correct parameters to createInvitation', async () => {
      await inviteAction.handler(runtime, message, state, {}, callback);

      expect(mockInvitationService.createInvitation).toHaveBeenCalledWith({
        created_by: message.entityId,
        invited_telegram_username: 'testuser',
      });
    });

    it('should return success with invitation code', async () => {
      const result = await inviteAction.handler(runtime, message, state, {}, callback);

      expect(result.success).toBe(true);
      expect(result.data?.code).toBe('TEST1234ABCD5678');
    });

    it('should call callback with formatted response', async () => {
      await inviteAction.handler(runtime, message, state, {}, callback);

      expect(callback).toHaveBeenCalled();
      const callArgs = (callback as any).mock.calls[0][0];
      expect(callArgs.text).toContain('TEST1234ABCD5678');
      expect(callArgs.text).toContain('Invitation Created');
      expect(callArgs.action).toBe('CREATE_INVITATION');
    });

    it('should include expiration date in response', async () => {
      await inviteAction.handler(runtime, message, state, {}, callback);

      const callArgs = (callback as any).mock.calls[0][0];
      expect(callArgs.text).toContain('Expires');
    });

    it('should handle missing entityUserName gracefully', async () => {
      message = createTestMemory({
        entityId: createUUID(),
        metadata: {}, // No entityUserName
        content: { text: 'I need an invite code', source: 'telegram' },
      });

      await inviteAction.handler(runtime, message, state, {}, callback);

      expect(mockInvitationService.createInvitation).toHaveBeenCalledWith({
        created_by: message.entityId,
        invited_telegram_username: undefined,
      });
    });

    it('should handle service errors gracefully', async () => {
      mockInvitationService.createInvitation = mock().mockRejectedValue(
        new Error('Database connection failed')
      );

      const result = await inviteAction.handler(runtime, message, state, {}, callback);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should call callback with error message on failure', async () => {
      mockInvitationService.createInvitation = mock().mockRejectedValue(
        new Error('Database connection failed')
      );

      await inviteAction.handler(runtime, message, state, {}, callback);

      expect(callback).toHaveBeenCalled();
      const callArgs = (callback as any).mock.calls[0][0];
      expect(callArgs.text).toContain('issue creating your invitation');
    });

    it('should handle missing InvitationService', async () => {
      runtime = createMockRuntime({
        getService: mock().mockReturnValue(null),
      });

      const result = await inviteAction.handler(runtime, message, state, {}, callback);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should work without callback', async () => {
      const result = await inviteAction.handler(runtime, message, state, {}, undefined);

      expect(result.success).toBe(true);
      expect(result.data?.code).toBe('TEST1234ABCD5678');
    });
  });
});
