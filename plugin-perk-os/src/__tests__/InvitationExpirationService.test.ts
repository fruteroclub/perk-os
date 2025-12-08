/**
 * InvitationExpirationService Unit Tests (CD-106)
 *
 * Tests for the background cron job that automatically expires invitations.
 */

import { describe, expect, it, beforeEach, afterEach, mock, spyOn } from 'bun:test';
import { InvitationExpirationService } from '../services/InvitationExpirationService';
import { InvitationService } from '../services/InvitationService';
import { createMockRuntime } from './test-utils';
import { logger } from '@elizaos/core';
import type { IAgentRuntime } from '@elizaos/core';

/**
 * Creates a mock InvitationService with controllable expirePendingInvitations
 */
function createMockInvitationService(expiredCount: number = 0): InvitationService {
  return {
    expirePendingInvitations: mock(() => Promise.resolve(expiredCount)),
  } as unknown as InvitationService;
}

/**
 * Creates a mock runtime that returns a mock InvitationService
 */
function createMockRuntimeWithInvitationService(
  mockInvitationService: InvitationService | null
): IAgentRuntime {
  const runtime = createMockRuntime();
  (runtime.getService as any).mockImplementation((serviceType: string) => {
    if (serviceType === 'invitation-service') {
      return mockInvitationService;
    }
    return null;
  });
  return runtime;
}

describe('InvitationExpirationService', () => {
  let service: InvitationExpirationService;
  let runtime: IAgentRuntime;
  let mockInvitationService: InvitationService;

  beforeEach(() => {
    // Suppress console output during tests
    spyOn(logger, 'info').mockImplementation(() => {});
    spyOn(logger, 'warn').mockImplementation(() => {});
    spyOn(logger, 'error').mockImplementation(() => {});

    mockInvitationService = createMockInvitationService(0);
    runtime = createMockRuntimeWithInvitationService(mockInvitationService);
  });

  afterEach(async () => {
    // Clean up any running intervals
    if (service) {
      await service.stop();
    }
  });

  describe('Service Metadata', () => {
    it('should have correct service type', () => {
      expect(InvitationExpirationService.serviceType).toBe('invitation-expiration-service');
    });

    it('should have capability description', () => {
      service = new InvitationExpirationService(runtime);
      expect(service.capabilityDescription).toBe(
        'Automatically expires pending invitations past their expiration date'
      );
    });
  });

  describe('Service Lifecycle', () => {
    it('should start the service via static start method', async () => {
      service = await InvitationExpirationService.start(runtime);
      expect(service).toBeInstanceOf(InvitationExpirationService);
      expect(logger.info).toHaveBeenCalled();
    });

    it('should run expiration immediately on startup', async () => {
      service = await InvitationExpirationService.start(runtime);

      // Should have called expirePendingInvitations on startup
      expect(mockInvitationService.expirePendingInvitations).toHaveBeenCalled();
    });

    it('should stop the service cleanly', async () => {
      service = await InvitationExpirationService.start(runtime);
      await service.stop();

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('stopped')
      );
    });

    it('should handle stop when not started', async () => {
      service = new InvitationExpirationService(runtime);
      // Should not throw when stopping without starting
      await expect(service.stop()).resolves.toBeUndefined();
    });
  });

  describe('expireInvitations', () => {
    it('should return 0 when no invitations expired', async () => {
      mockInvitationService = createMockInvitationService(0);
      runtime = createMockRuntimeWithInvitationService(mockInvitationService);
      service = new InvitationExpirationService(runtime);
      await service.initialize(runtime);

      const count = await service.expireInvitations();
      expect(count).toBe(0);
    });

    it('should return count of expired invitations', async () => {
      mockInvitationService = createMockInvitationService(5);
      runtime = createMockRuntimeWithInvitationService(mockInvitationService);
      service = new InvitationExpirationService(runtime);
      await service.initialize(runtime);

      const count = await service.expireInvitations();
      expect(count).toBe(5);
    });

    it('should log when invitations are expired', async () => {
      mockInvitationService = createMockInvitationService(3);
      runtime = createMockRuntimeWithInvitationService(mockInvitationService);
      service = new InvitationExpirationService(runtime);
      await service.initialize(runtime);

      await service.expireInvitations();

      expect(logger.info).toHaveBeenCalledWith(
        expect.stringContaining('Expired 3 invitations')
      );
    });

    it('should not log when no invitations expired', async () => {
      mockInvitationService = createMockInvitationService(0);
      runtime = createMockRuntimeWithInvitationService(mockInvitationService);
      service = new InvitationExpirationService(runtime);

      // Clear previous logger calls
      (logger.info as any).mockClear();

      await service.initialize(runtime);
      // Clear the initialization logs
      (logger.info as any).mockClear();

      await service.expireInvitations();

      // Should not have logged about expired invitations
      const calls = (logger.info as any).mock.calls || [];
      const expiredLogCall = calls.find((call: any[]) =>
        call[0]?.includes('Expired') && call[0]?.includes('invitations')
      );
      expect(expiredLogCall).toBeUndefined();
    });

    it('should handle errors gracefully', async () => {
      const errorService = {
        expirePendingInvitations: mock(() =>
          Promise.reject(new Error('Database connection failed'))
        ),
      } as unknown as InvitationService;

      runtime = createMockRuntimeWithInvitationService(errorService);
      service = new InvitationExpirationService(runtime);
      await service.initialize(runtime);

      const count = await service.expireInvitations();

      expect(count).toBe(0);
      expect(logger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error expiring invitations'),
        expect.any(Error)
      );
    });
  });

  describe('InvitationService Availability', () => {
    it('should warn when InvitationService not available during init', async () => {
      runtime = createMockRuntimeWithInvitationService(null);
      service = new InvitationExpirationService(runtime);
      await service.initialize(runtime);

      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('InvitationService not available')
      );
    });

    it('should lazy-load InvitationService on first expiration call', async () => {
      // Start with no service
      let serviceAvailable = false;
      const lazyRuntime = createMockRuntime();
      (lazyRuntime.getService as any).mockImplementation((serviceType: string) => {
        if (serviceType === 'invitation-service' && serviceAvailable) {
          return createMockInvitationService(2);
        }
        return null;
      });

      service = new InvitationExpirationService(lazyRuntime);
      await service.initialize(lazyRuntime);

      // First call should fail gracefully
      let count = await service.expireInvitations();
      expect(count).toBe(0);

      // Make service available
      serviceAvailable = true;

      // Second call should work
      count = await service.expireInvitations();
      expect(count).toBe(2);
    });

    it('should return 0 when InvitationService never becomes available', async () => {
      runtime = createMockRuntimeWithInvitationService(null);
      service = new InvitationExpirationService(runtime);
      await service.initialize(runtime);

      const count = await service.expireInvitations();
      expect(count).toBe(0);
      expect(logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('still not available')
      );
    });
  });

  describe('Cron Schedule', () => {
    it('should set up interval on initialize', async () => {
      // Use a spy to track setInterval
      const originalSetInterval = global.setInterval;
      const setIntervalSpy = spyOn(global, 'setInterval');

      service = new InvitationExpirationService(runtime);
      await service.initialize(runtime);

      expect(setIntervalSpy).toHaveBeenCalled();
      const [callback, interval] = setIntervalSpy.mock.calls[0];
      expect(interval).toBe(60 * 60 * 1000); // 1 hour

      global.setInterval = originalSetInterval;
    });

    it('should clear interval on stop', async () => {
      const originalClearInterval = global.clearInterval;
      const clearIntervalSpy = spyOn(global, 'clearInterval');

      service = await InvitationExpirationService.start(runtime);
      await service.stop();

      expect(clearIntervalSpy).toHaveBeenCalled();

      global.clearInterval = originalClearInterval;
    });
  });
});
