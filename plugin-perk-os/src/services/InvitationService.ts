/**
 * InvitationService - Community Directory Invitation Management
 *
 * ElizaOS Service implementing CRUD operations for community invitations.
 * Handles invitation code generation, expiration logic, and status transitions.
 *
 * Status lifecycle: pending → accepted | cancelled | expired
 */

import { Service, IAgentRuntime, logger } from '@elizaos/core';
import { eq, and, desc, lt } from 'drizzle-orm';
import { communityInvitations } from '../database/schema';
import type { CommunityInvitation, InvitationStatus, CreateInvitationInput } from '../types';

export class InvitationService extends Service {
  static serviceType = 'invitation-service';
  capabilityDescription = 'Manages community invitations with CRUD operations';

  constructor(protected runtime: IAgentRuntime) {
    super(runtime);
  }

  /**
   * Get database instance from runtime
   * Uses Drizzle ORM via ElizaOS db property
   */
  private get db() {
    return (this.runtime as any).db;
  }

  // ============================================
  // CRUD Operations
  // ============================================

  /**
   * Create a new invitation with unique 16-character code
   * @param input - Creation parameters including created_by member_id
   * @returns The created invitation
   */
  async createInvitation(input: CreateInvitationInput): Promise<CommunityInvitation> {
    const invitationCode = this.generateInvitationCode();
    const expiresInDays = input.expires_in_days ?? 3;
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

    const [invitation] = await this.db
      .insert(communityInvitations)
      .values({
        invitation_code: invitationCode,
        created_by: input.created_by,
        invited_telegram_username: input.invited_telegram_username,
        status: 'pending' as InvitationStatus,
        expires_at: expiresAt,
      })
      .returning();

    logger.info(
      `[InvitationService] Created invitation ${invitationCode} by ${input.created_by}, expires ${expiresAt.toISOString()}`
    );
    return this.mapToInvitation(invitation);
  }

  /**
   * Get invitation by code (auto-checks expiration)
   * @param code - The 16-character invitation code
   * @returns The invitation or null if not found
   */
  async getInvitationByCode(code: string): Promise<CommunityInvitation | null> {
    const normalizedCode = code.toUpperCase().trim();

    const [invitation] = await this.db
      .select()
      .from(communityInvitations)
      .where(eq(communityInvitations.invitation_code, normalizedCode))
      .limit(1);

    if (!invitation) {
      return null;
    }

    // Auto-expire if pending and past expiration date
    if (invitation.status === 'pending' && new Date(invitation.expires_at) < new Date()) {
      await this.updateInvitationStatus(invitation.invitation_id, 'expired');
      logger.info(`[InvitationService] Auto-expired invitation ${normalizedCode}`);
      return { ...this.mapToInvitation(invitation), status: 'expired' };
    }

    return this.mapToInvitation(invitation);
  }

  /**
   * Get invitation by ID
   * @param invitationId - The UUID of the invitation
   * @returns The invitation or null if not found
   */
  async getInvitationById(invitationId: string): Promise<CommunityInvitation | null> {
    const [invitation] = await this.db
      .select()
      .from(communityInvitations)
      .where(eq(communityInvitations.invitation_id, invitationId))
      .limit(1);

    if (!invitation) {
      return null;
    }

    return this.mapToInvitation(invitation);
  }

  /**
   * List invitations with optional filtering
   * @param createdBy - Filter by creator member_id
   * @param status - Filter by invitation status
   * @returns Array of matching invitations
   */
  async listInvitations(
    createdBy?: string,
    status?: InvitationStatus
  ): Promise<CommunityInvitation[]> {
    const conditions = [];

    if (createdBy) {
      conditions.push(eq(communityInvitations.created_by, createdBy));
    }
    if (status) {
      conditions.push(eq(communityInvitations.status, status));
    }

    const invitations = await this.db
      .select()
      .from(communityInvitations)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(communityInvitations.created_at));

    return invitations.map((inv: any) => this.mapToInvitation(inv));
  }

  /**
   * Accept an invitation
   * @param code - The invitation code to accept
   * @param acceptedBy - The member_id of the accepting user
   * @throws Error if invitation not found or not in pending status
   */
  async acceptInvitation(code: string, acceptedBy: string): Promise<CommunityInvitation> {
    const invitation = await this.getInvitationByCode(code);

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new Error(`Cannot accept invitation: status is ${invitation.status}`);
    }

    const [updated] = await this.db
      .update(communityInvitations)
      .set({
        status: 'accepted' as InvitationStatus,
        accepted_by: acceptedBy,
        accepted_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(communityInvitations.invitation_id, invitation.invitation_id))
      .returning();

    logger.info(`[InvitationService] Invitation ${code} accepted by ${acceptedBy}`);
    return this.mapToInvitation(updated);
  }

  /**
   * Cancel an invitation
   * @param invitationId - The UUID of the invitation to cancel
   * @throws Error if invitation not found
   */
  async cancelInvitation(invitationId: string): Promise<CommunityInvitation> {
    const invitation = await this.getInvitationById(invitationId);

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new Error(`Cannot cancel invitation: status is ${invitation.status}`);
    }

    const [updated] = await this.db
      .update(communityInvitations)
      .set({
        status: 'cancelled' as InvitationStatus,
        updated_at: new Date(),
      })
      .where(eq(communityInvitations.invitation_id, invitationId))
      .returning();

    logger.info(`[InvitationService] Invitation ${invitationId} cancelled`);
    return this.mapToInvitation(updated);
  }

  /**
   * Expire all pending invitations past their expiration date
   * Called by cron job (CD-106)
   * @returns Number of invitations expired
   */
  async expirePendingInvitations(): Promise<number> {
    const result = await this.db
      .update(communityInvitations)
      .set({
        status: 'expired' as InvitationStatus,
        updated_at: new Date(),
      })
      .where(
        and(
          eq(communityInvitations.status, 'pending'),
          lt(communityInvitations.expires_at, new Date())
        )
      )
      .returning();

    if (result.length > 0) {
      logger.info(`[InvitationService] Expired ${result.length} pending invitations`);
    }

    return result.length;
  }

  /**
   * Get statistics for invitations created by a member
   * @param createdBy - The member_id to get stats for
   * @returns Counts by status
   */
  async getInvitationStats(
    createdBy: string
  ): Promise<Record<InvitationStatus, number>> {
    const invitations = await this.listInvitations(createdBy);

    const stats: Record<InvitationStatus, number> = {
      pending: 0,
      accepted: 0,
      expired: 0,
      cancelled: 0,
    };

    for (const inv of invitations) {
      stats[inv.status]++;
    }

    return stats;
  }

  // ============================================
  // Private Helpers
  // ============================================

  /**
   * Generate a unique 16-character invitation code
   * Uses UUID v4, strips hyphens, takes first 16 chars, uppercase
   */
  private generateInvitationCode(): string {
    return crypto.randomUUID().replace(/-/g, '').substring(0, 16).toUpperCase();
  }

  /**
   * Update invitation status
   */
  private async updateInvitationStatus(
    invitationId: string,
    status: InvitationStatus
  ): Promise<void> {
    await this.db
      .update(communityInvitations)
      .set({
        status,
        updated_at: new Date(),
      })
      .where(eq(communityInvitations.invitation_id, invitationId));
  }

  /**
   * Map database row to CommunityInvitation interface
   */
  private mapToInvitation(row: any): CommunityInvitation {
    return {
      invitation_id: row.invitation_id,
      invitation_code: row.invitation_code,
      created_by: row.created_by,
      invited_telegram_username: row.invited_telegram_username ?? undefined,
      status: row.status as InvitationStatus,
      expires_at: new Date(row.expires_at),
      accepted_by: row.accepted_by ?? undefined,
      accepted_at: row.accepted_at ? new Date(row.accepted_at) : undefined,
      created_at: new Date(row.created_at),
      updated_at: new Date(row.updated_at),
    };
  }

  // ============================================
  // Service Lifecycle
  // ============================================

  static async start(runtime: IAgentRuntime) {
    logger.info('[InvitationService] Starting invitation service');
    const service = new InvitationService(runtime);
    return service;
  }

  static async stop(runtime: IAgentRuntime) {
    logger.info('[InvitationService] Stopping invitation service');
    const service = runtime.getService(InvitationService.serviceType);
    if (!service) {
      throw new Error('Invitation service not found');
    }
    service.stop();
  }

  async stop() {
    logger.info('[InvitationService] Service stopped');
  }
}

export default InvitationService;
