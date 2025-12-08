/**
 * Invitation Expiration Service (CD-106)
 *
 * Background service that automatically expires pending invitations
 * that are past their expiration date.
 *
 * Runs every hour and updates expired invitations to 'expired' status.
 */

import { Service, type IAgentRuntime, logger } from '@elizaos/core';
import { InvitationService } from './InvitationService.ts';

const EXPIRATION_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

export class InvitationExpirationService extends Service {
  static serviceType = 'invitation-expiration-service';
  capabilityDescription = 'Automatically expires pending invitations past their expiration date';

  private intervalId?: ReturnType<typeof setInterval>;
  private invitationService?: InvitationService;

  constructor(runtime: IAgentRuntime) {
    super(runtime);
  }

  /**
   * Initialize the expiration cron job
   * Runs immediately on startup, then every hour
   */
  async initialize(runtime: IAgentRuntime): Promise<void> {
    logger.info('[InvitationExpirationService] Initializing expiration cron job');

    // Get InvitationService instance from runtime
    this.invitationService = runtime.getService('invitation-service') as InvitationService;

    if (!this.invitationService) {
      logger.warn(
        '[InvitationExpirationService] InvitationService not available, will retry on first run'
      );
    }

    // Run immediately on startup
    await this.expireInvitations();

    // Schedule hourly runs
    this.intervalId = setInterval(() => {
      this.expireInvitations().catch((error) => {
        logger.error('[InvitationExpirationService] Error in scheduled expiration:', error);
      });
    }, EXPIRATION_INTERVAL_MS);

    logger.info('[InvitationExpirationService] Cron job started (runs every hour)');
  }

  /**
   * Expire all pending invitations past their expiration date
   */
  async expireInvitations(): Promise<number> {
    try {
      // Lazy-load InvitationService if not available during init
      if (!this.invitationService) {
        this.invitationService = this.runtime.getService('invitation-service') as InvitationService;
        if (!this.invitationService) {
          logger.warn('[InvitationExpirationService] InvitationService still not available');
          return 0;
        }
      }

      const expiredCount = await this.invitationService.expirePendingInvitations();

      if (expiredCount > 0) {
        logger.info(`[InvitationExpirationService] Expired ${expiredCount} invitations`);
      }

      return expiredCount;
    } catch (error) {
      logger.error('[InvitationExpirationService] Error expiring invitations:', error);
      return 0;
    }
  }

  /**
   * Stop the cron job and clean up
   */
  async stop(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
      logger.info('[InvitationExpirationService] Cron job stopped');
    }
  }

  /**
   * Static factory method for ElizaOS service registration
   */
  static async start(runtime: IAgentRuntime): Promise<InvitationExpirationService> {
    const service = new InvitationExpirationService(runtime);
    await service.initialize(runtime);
    return service;
  }
}

export default InvitationExpirationService;
