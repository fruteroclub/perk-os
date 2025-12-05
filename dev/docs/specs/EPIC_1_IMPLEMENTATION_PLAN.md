# Epic 1: Community Directory - Implementation Plan

**Epic**: Community Directory
**Timeline**: 3 Sprints (6 weeks)
**Team Size**: 2-3 developers
**Status**: Ready for Development
**Version**: 1.1
**Date**: 2024-12-04
**Last Updated**: 2024-12-04 (GitHub verification pivot)

---

## ⚠️ Important Update: Verification Strategy Change

**Change**: MVP verification shifted from wallet signatures to GitHub verification

**Must Have (MVP)**:
- ✅ GitHub profile verification (username, activity data)
- ✅ Basic reputation score from GitHub metrics
- ✅ Wallet address collection (optional, no verification)

**Should Have (Post-MVP Sprint 5)**:
- Wallet signature verification (EVM via ethers.js)
- Advanced GitHub metrics
- Composite reputation from multiple sources

**Rationale**: GitHub verification provides immediate value for developer community, simpler implementation, removes blockchain RPC dependency from MVP, enables reputation scoring from day 1.

---

## 🎯 Sprint Overview

### Sprint 1: Foundation (Weeks 1-2)
**Goal**: Database setup and invitation system
**Story Points**: 21
**Key Deliverable**: Managers can create and manage invitations

### Sprint 2: Registration & Verification (Weeks 3-4)
**Goal**: Member registration flow with GitHub verification
**Story Points**: 27
**Key Deliverable**: Complete registration journey from invite to active member with GitHub-based reputation

### Sprint 3: Directory & Admin Tools (Weeks 5-6)
**Goal**: Member directory, participation tracking, bulk messaging
**Story Points**: 28
**Key Deliverable**: Fully functional community directory with admin tools

**Total Effort**: 76 story points (approximately 6 weeks with 2 developers)

---

## 📋 Sprint 1: Foundation (Weeks 1-2)

### Story 1.1: Database Schema Setup
**Points**: 5
**Priority**: P0 (Blocker)
**Dependencies**: None

#### Ticket CD-101: Create Database Migrations
**Description**: Create PostgreSQL migrations for all community directory tables

**Tasks**:
- [ ] Create `community_invitations` table with indexes
- [ ] Create `community_members` table with indexes
- [ ] Create `member_relationships` table with JSONB content
- [ ] Create `member_participation` table
- [ ] Create `member_daily_highlights` table (future)
- [ ] Add foreign key constraints
- [ ] Write rollback migrations
- [ ] Test migrations on clean database

**Acceptance Criteria**:
- [ ] All tables created with correct schema
- [ ] Indexes created for performance
- [ ] Foreign keys enforce referential integrity
- [ ] Migrations run without errors
- [ ] Rollback migrations restore previous state

**Files**:
- `migrations/001_create_community_tables.sql`
- `migrations/001_create_community_tables_rollback.sql`

**Testing**:
```bash
# Apply migrations
bun run migrate:up

# Verify schema
psql -d frutero_community -c "\d community_invitations"
psql -d frutero_community -c "\d community_members"

# Test rollback
bun run migrate:down
bun run migrate:up
```

---

### Story 1.2: Plugin Structure Setup
**Points**: 3
**Priority**: P0 (Blocker)
**Dependencies**: None

#### Ticket CD-102: Set Up Plugin Structure and TypeScript Interfaces
**Description**: Create ElizaOS plugin boilerplate with TypeScript types

**Tasks**:
- [ ] Create `src/plugins/communityDirectory/` directory structure
- [ ] Define TypeScript interfaces in `types/` directory
- [ ] Create plugin index with exports
- [ ] Register plugin in `src/index.ts` projectAgent
- [ ] Add plugin to ElizaOS runtime configuration
- [ ] Create plugin README with architecture overview

**Acceptance Criteria**:
- [ ] Plugin structure follows ElizaOS conventions
- [ ] TypeScript interfaces compile without errors
- [ ] Plugin loads without errors in ElizaOS runtime
- [ ] All types exported from plugin index

**Files**:
```
src/plugins/communityDirectory/
├── index.ts                    # Plugin export
├── types/
│   ├── member.ts              # Member, MemberStatus, MemberRole
│   ├── invitation.ts          # Invitation, InvitationStatus
│   ├── memory.ts              # MemberRelationship, ParticipationEvent
│   └── index.ts               # Type exports
├── actions/
├── services/
├── providers/
├── utils/
└── README.md
```

**TypeScript Interfaces**:
```typescript
// types/member.ts
export enum MemberStatus {
  NOT_MEMBER = 'not_member',
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BANNED = 'banned',
}

export enum MemberRole {
  STUDENT = 'student',
  DEVELOPER = 'developer',
  DESIGNER = 'designer',
  RESEARCHER = 'researcher',
  COMMUNITY_MANAGER = 'community_manager',
  OTHER = 'other',
}

export interface Member {
  member_id: string;
  telegram_id: string;
  telegram_username: string;
  name: string;
  role: MemberRole;
  organization?: string;
  country?: string;
  wallet_address: string;
  wallet_verified: boolean;
  wallet_verified_at?: Date;
  status: MemberStatus;
  reputation_score: number;
  invited_by?: string;
  registration_fee_paid: boolean;
  registration_fee_tx_hash?: string;
  profile_data?: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

// types/invitation.ts
export enum InvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

export interface Invitation {
  invitation_id: string;
  invitation_code: string;
  created_by: string;
  invited_telegram_username?: string;
  status: InvitationStatus;
  expires_at: Date;
  accepted_by?: string;
  accepted_at?: Date;
  created_at: Date;
  updated_at: Date;
}
```

**Testing**:
```bash
bun run type-check
elizaos dev  # Verify plugin loads
```

---

### Story 1.3: Invitation Service Implementation
**Points**: 5
**Priority**: P0 (Blocker)
**Dependencies**: CD-101, CD-102

#### Ticket CD-103: Implement InvitationService with CRUD Operations
**Description**: Build service class for invitation management with database operations

**Tasks**:
- [ ] Create `InvitationService` class extending ElizaOS Service
- [ ] Implement `createInvitation(createdBy, telegramUsername?)` method
- [ ] Implement `getInvitationByCode(code)` method
- [ ] Implement `listInvitations(createdBy?, status?)` method
- [ ] Implement `cancelInvitation(invitationId)` method
- [ ] Implement `acceptInvitation(code, acceptedBy)` method
- [ ] Add invitation expiration check logic
- [ ] Create invitation code generator (UUID or custom)
- [ ] Add unit tests for all methods

**Acceptance Criteria**:
- [ ] All CRUD operations work correctly
- [ ] Invitation codes are unique and secure
- [ ] Expiration logic prevents use of expired invitations
- [ ] Service handles errors gracefully
- [ ] Unit tests cover all methods with >80% coverage

**Files**:
- `src/plugins/communityDirectory/services/InvitationService.ts`
- `src/plugins/communityDirectory/__tests__/invitation.test.ts`

**Implementation**:
```typescript
// services/InvitationService.ts
import { Service, IAgentRuntime } from '@elizaos/core';
import { v4 as uuidv4 } from 'uuid';
import { Invitation, InvitationStatus } from '../types';

export class InvitationService extends Service {
  static serviceType = 'invitation-service';

  async createInvitation(
    createdBy: string,
    invitedTelegramUsername?: string
  ): Promise<Invitation> {
    const invitationCode = uuidv4().replace(/-/g, '').substring(0, 16);
    const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days

    const result = await this.runtime.database.query(
      `INSERT INTO community_invitations
       (invitation_code, created_by, invited_telegram_username, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [invitationCode, createdBy, invitedTelegramUsername, expiresAt]
    );

    return result.rows[0];
  }

  async getInvitationByCode(code: string): Promise<Invitation | null> {
    const result = await this.runtime.database.query(
      `SELECT * FROM community_invitations WHERE invitation_code = $1`,
      [code]
    );

    if (result.rows.length === 0) return null;

    const invitation = result.rows[0];

    // Check expiration
    if (new Date(invitation.expires_at) < new Date() && invitation.status === InvitationStatus.PENDING) {
      await this.updateInvitationStatus(invitation.invitation_id, InvitationStatus.EXPIRED);
      return { ...invitation, status: InvitationStatus.EXPIRED };
    }

    return invitation;
  }

  async listInvitations(
    createdBy?: string,
    status?: InvitationStatus
  ): Promise<Invitation[]> {
    let query = 'SELECT * FROM community_invitations WHERE 1=1';
    const params: any[] = [];

    if (createdBy) {
      params.push(createdBy);
      query += ` AND created_by = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    query += ' ORDER BY created_at DESC';

    const result = await this.runtime.database.query(query, params);
    return result.rows;
  }

  async cancelInvitation(invitationId: string): Promise<void> {
    await this.updateInvitationStatus(invitationId, InvitationStatus.CANCELLED);
  }

  async acceptInvitation(code: string, acceptedBy: string): Promise<void> {
    const invitation = await this.getInvitationByCode(code);

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new Error(`Invitation is ${invitation.status}`);
    }

    await this.runtime.database.query(
      `UPDATE community_invitations
       SET status = $1, accepted_by = $2, accepted_at = NOW()
       WHERE invitation_id = $3`,
      [InvitationStatus.ACCEPTED, acceptedBy, invitation.invitation_id]
    );
  }

  private async updateInvitationStatus(
    invitationId: string,
    status: InvitationStatus
  ): Promise<void> {
    await this.runtime.database.query(
      `UPDATE community_invitations SET status = $1 WHERE invitation_id = $2`,
      [status, invitationId]
    );
  }

  static async start(runtime: IAgentRuntime): Promise<InvitationService> {
    const service = new InvitationService(runtime);
    return service;
  }
}
```

**Testing**:
```typescript
// __tests__/invitation.test.ts
import { describe, test, expect, beforeEach } from 'bun:test';
import { InvitationService } from '../services/InvitationService';
import { mockRuntime } from './utils/mockRuntime';

describe('InvitationService', () => {
  let service: InvitationService;

  beforeEach(() => {
    service = new InvitationService(mockRuntime);
  });

  test('createInvitation generates valid invitation code', async () => {
    const invitation = await service.createInvitation('manager-123');
    expect(invitation.invitation_code).toHaveLength(16);
    expect(invitation.status).toBe('pending');
  });

  test('getInvitationByCode returns null for invalid code', async () => {
    const invitation = await service.getInvitationByCode('invalid');
    expect(invitation).toBeNull();
  });

  test('acceptInvitation updates status and records acceptor', async () => {
    const invitation = await service.createInvitation('manager-123');
    await service.acceptInvitation(invitation.invitation_code, 'member-456');
    const updated = await service.getInvitationByCode(invitation.invitation_code);
    expect(updated?.status).toBe('accepted');
    expect(updated?.accepted_by).toBe('member-456');
  });
});
```

---

### Story 1.4: Telegram Invitation Command
**Points**: 3
**Priority**: P1 (High)
**Dependencies**: CD-103

#### Ticket CD-104: Create Telegram Bot Command `/invite`
**Description**: Implement Telegram bot action for managers to send invitations

**Tasks**:
- [ ] Create `inviteAction` in `actions/invite.ts`
- [ ] Add validation for Community Manager role
- [ ] Implement conversation flow for invitation creation
- [ ] Collect optional Telegram username
- [ ] Generate invitation and display code/link
- [ ] Add examples for training data
- [ ] Test in Telegram development bot

**Acceptance Criteria**:
- [ ] Only Community Managers can use `/invite` command
- [ ] Invitation code generated and displayed
- [ ] Invitation link formatted for easy sharing
- [ ] Error messages clear and helpful
- [ ] Action registered in plugin

**Files**:
- `src/plugins/communityDirectory/actions/invite.ts`

**Implementation**:
```typescript
// actions/invite.ts
import { Action, IAgentRuntime, Memory, State, HandlerCallback } from '@elizaos/core';
import { InvitationService } from '../services/InvitationService';

export const inviteAction: Action = {
  name: 'INVITE_MEMBER',
  similes: ['SEND_INVITATION', 'CREATE_INVITE', 'INVITE'],
  description: 'Create an invitation for a new community member',

  validate: async (runtime: IAgentRuntime, message: Memory, state?: State) => {
    // Check if user is Community Manager
    const userId = message.userId;
    const member = await runtime.database.query(
      'SELECT role, status FROM community_members WHERE telegram_id = $1',
      [userId]
    );

    if (member.rows.length === 0) {
      return false;
    }

    const { role, status } = member.rows[0];
    return role === 'community_manager' && status === 'active';
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state?: State,
    options?: any,
    callback?: HandlerCallback
  ) => {
    const invitationService = runtime.getService('invitation-service') as InvitationService;

    // Get manager member_id
    const managerResult = await runtime.database.query(
      'SELECT member_id FROM community_members WHERE telegram_id = $1',
      [message.userId]
    );
    const managerId = managerResult.rows[0].member_id;

    // Extract optional Telegram username from message
    const telegramUsername = extractTelegramUsername(message.content.text);

    // Create invitation
    const invitation = await invitationService.createInvitation(
      managerId,
      telegramUsername
    );

    // Format response
    const inviteLink = `https://t.me/frutero_bot?start=${invitation.invitation_code}`;
    const expiresAt = new Date(invitation.expires_at).toLocaleString();

    const responseText = `
🎉 Invitation created successfully!

**Invitation Code**: \`${invitation.invitation_code}\`
**Invite Link**: ${inviteLink}

This invitation expires on **${expiresAt}** (3 days from now).

Share this link with the person you'd like to invite to Frutero Club! 🥭
    `.trim();

    if (callback) {
      await callback({
        text: responseText,
        actions: ['INVITE_MEMBER'],
      });
    }

    return {
      success: true,
      text: responseText,
      values: {
        invitation_code: invitation.invitation_code,
        invite_link: inviteLink,
      },
    };
  },

  examples: [
    [
      {
        user: '{{user1}}',
        content: { text: '/invite' },
      },
      {
        user: '{{agent}}',
        content: {
          text: 'I\'d be happy to create an invitation! Would you like to send it to a specific Telegram user, or generate a general invite link?',
          action: 'INVITE_MEMBER',
        },
      },
      {
        user: '{{user1}}',
        content: { text: 'Just a general link' },
      },
      {
        user: '{{agent}}',
        content: {
          text: '🎉 Invitation created successfully!\n\n**Invitation Code**: `abc123def456`\n**Invite Link**: https://t.me/frutero_bot?start=abc123def456\n\nThis invitation expires in 3 days. Share this link with someone you\'d like to invite! 🥭',
          action: 'INVITE_MEMBER',
        },
      },
    ],
  ],
};

function extractTelegramUsername(text: string): string | undefined {
  const match = text.match(/@(\w+)/);
  return match ? match[1] : undefined;
}
```

**Testing**:
```bash
# In Telegram development bot
/invite
/invite @testuser
/invite alice@example.com
```

---

### Story 1.5: Web UI for Invitation Management
**Points**: 3
**Priority**: P2 (Medium)
**Dependencies**: CD-103

#### Ticket CD-105: Build Web UI for Invitation Management
**Description**: Create web interface for managers to view and manage invitations

**Tasks**:
- [ ] Create `/api/invitations` route
- [ ] Build invitation list page (`/invitations`)
- [ ] Display invitation cards with status
- [ ] Add create invitation button
- [ ] Add cancel invitation action
- [ ] Show invitation expiration countdown
- [ ] Add copy invitation link button
- [ ] Implement role-based access control

**Acceptance Criteria**:
- [ ] Managers can view all their invitations
- [ ] Invitation status displayed clearly (pending/accepted/expired/cancelled)
- [ ] Copy link button works with toast notification
- [ ] Cancel action requires confirmation
- [ ] Only Community Managers can access page

**Files**:
- `src/plugins/communityDirectory/routes/invitation.ts`
- `src/frontend/pages/Invitations.tsx`
- `src/frontend/components/InvitationCard.tsx`

**Implementation**:
```typescript
// routes/invitation.ts
import { Router } from 'express';
import { IAgentRuntime } from '@elizaos/core';
import { InvitationService } from '../services/InvitationService';

export function createInvitationRoutes(runtime: IAgentRuntime): Router {
  const router = Router();
  const invitationService = runtime.getService('invitation-service') as InvitationService;

  // GET /api/invitations - List invitations
  router.get('/', async (req, res) => {
    try {
      const { userId } = req.user; // From auth middleware

      // Get member_id from telegram_id
      const member = await runtime.database.query(
        'SELECT member_id, role FROM community_members WHERE telegram_id = $1',
        [userId]
      );

      if (member.rows.length === 0 || member.rows[0].role !== 'community_manager') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const memberId = member.rows[0].member_id;
      const invitations = await invitationService.listInvitations(memberId);

      res.json({ invitations });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch invitations' });
    }
  });

  // POST /api/invitations - Create invitation
  router.post('/', async (req, res) => {
    try {
      const { userId } = req.user;
      const { telegram_username } = req.body;

      const member = await runtime.database.query(
        'SELECT member_id, role FROM community_members WHERE telegram_id = $1',
        [userId]
      );

      if (member.rows.length === 0 || member.rows[0].role !== 'community_manager') {
        return res.status(403).json({ error: 'Forbidden' });
      }

      const memberId = member.rows[0].member_id;
      const invitation = await invitationService.createInvitation(
        memberId,
        telegram_username
      );

      res.json({ invitation });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create invitation' });
    }
  });

  // DELETE /api/invitations/:id - Cancel invitation
  router.delete('/:id', async (req, res) => {
    try {
      const { userId } = req.user;
      const { id } = req.params;

      // Verify manager owns this invitation
      const invitation = await runtime.database.query(
        `SELECT i.*, m.telegram_id
         FROM community_invitations i
         JOIN community_members m ON i.created_by = m.member_id
         WHERE i.invitation_id = $1`,
        [id]
      );

      if (invitation.rows.length === 0 || invitation.rows[0].telegram_id !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }

      await invitationService.cancelInvitation(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to cancel invitation' });
    }
  });

  return router;
}
```

```tsx
// frontend/pages/Invitations.tsx
import React, { useState, useEffect } from 'react';
import { InvitationCard } from '../components/InvitationCard';
import { Button } from '../components/ui/button';

interface Invitation {
  invitation_id: string;
  invitation_code: string;
  status: string;
  expires_at: string;
  invited_telegram_username?: string;
  created_at: string;
}

export function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInvitations();
  }, []);

  async function fetchInvitations() {
    const response = await fetch('/api/invitations');
    const data = await response.json();
    setInvitations(data.invitations);
    setLoading(false);
  }

  async function createInvitation() {
    const response = await fetch('/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    const data = await response.json();
    setInvitations([data.invitation, ...invitations]);
  }

  async function cancelInvitation(id: string) {
    await fetch(`/api/invitations/${id}`, { method: 'DELETE' });
    setInvitations(invitations.filter(inv => inv.invitation_id !== id));
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Invitations</h1>
        <Button onClick={createInvitation}>Create Invitation</Button>
      </div>

      <div className="grid gap-4">
        {invitations.map(invitation => (
          <InvitationCard
            key={invitation.invitation_id}
            invitation={invitation}
            onCancel={cancelInvitation}
          />
        ))}
      </div>
    </div>
  );
}
```

---

### Story 1.6: Invitation Expiration Cron Job
**Points**: 2
**Priority**: P2 (Medium)
**Dependencies**: CD-103

#### Ticket CD-106: Add Invitation Expiration Cron Job
**Description**: Create background service to automatically expire old invitations

**Tasks**:
- [ ] Create `InvitationExpirationService` extending ElizaOS Service
- [ ] Implement cron job running every hour
- [ ] Query for pending invitations past expiration date
- [ ] Update status to `expired` for expired invitations
- [ ] Add logging for expired invitations
- [ ] Test cron job execution

**Acceptance Criteria**:
- [ ] Cron job runs every hour
- [ ] Expired invitations updated to `expired` status
- [ ] Logging shows number of invitations expired
- [ ] Service starts with plugin initialization

**Files**:
- `src/plugins/communityDirectory/services/InvitationExpirationService.ts`

**Implementation**:
```typescript
// services/InvitationExpirationService.ts
import { Service, IAgentRuntime } from '@elizaos/core';

export class InvitationExpirationService extends Service {
  static serviceType = 'invitation-expiration-service';
  private intervalId?: NodeJS.Timeout;

  async initialize(runtime: IAgentRuntime): Promise<void> {
    // Run every hour
    this.intervalId = setInterval(() => this.expireInvitations(), 60 * 60 * 1000);

    // Run immediately on startup
    await this.expireInvitations();
  }

  async expireInvitations(): Promise<void> {
    try {
      const result = await this.runtime.database.query(
        `UPDATE community_invitations
         SET status = 'expired'
         WHERE status = 'pending' AND expires_at < NOW()
         RETURNING invitation_id`
      );

      const expiredCount = result.rows.length;
      if (expiredCount > 0) {
        console.log(`[InvitationExpirationService] Expired ${expiredCount} invitations`);
      }
    } catch (error) {
      console.error('[InvitationExpirationService] Error expiring invitations:', error);
    }
  }

  async stop(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  static async start(runtime: IAgentRuntime): Promise<InvitationExpirationService> {
    const service = new InvitationExpirationService(runtime);
    await service.initialize(runtime);
    return service;
  }
}
```

**Testing**:
```typescript
// __tests__/invitationExpiration.test.ts
import { describe, test, expect, beforeEach } from 'bun:test';
import { InvitationExpirationService } from '../services/InvitationExpirationService';
import { mockRuntime } from './utils/mockRuntime';

describe('InvitationExpirationService', () => {
  test('expireInvitations updates status for expired invitations', async () => {
    const service = new InvitationExpirationService(mockRuntime);

    // Create expired invitation
    await mockRuntime.database.query(
      `INSERT INTO community_invitations
       (invitation_code, created_by, expires_at, status)
       VALUES ('test123', 'manager-1', NOW() - INTERVAL '1 day', 'pending')`
    );

    await service.expireInvitations();

    // Verify status updated
    const result = await mockRuntime.database.query(
      `SELECT status FROM community_invitations WHERE invitation_code = 'test123'`
    );
    expect(result.rows[0].status).toBe('expired');
  });
});
```

---

## 📋 Sprint 2: Registration & Verification (Weeks 3-4)

### Story 2.1: Registration Conversation Flow
**Points**: 8
**Priority**: P0 (Blocker)
**Dependencies**: CD-103

#### Ticket CD-201: Implement Registration Conversation State Machine
**Description**: Build multi-step conversational registration flow with kukulcán

**Tasks**:
- [ ] Create `registerAction` with conversation state machine
- [ ] Implement state: `INVITE_VALIDATION`
- [ ] Implement state: `PROFILE_COLLECTION`
- [ ] Implement state: `GITHUB_REQUEST`
- [ ] Implement state: `GITHUB_VERIFICATION`
- [ ] Implement state: `REPUTATION_CALCULATION`
- [ ] Implement state: `WALLET_REQUEST` (optional)
- [ ] Implement state: `COMPLETION`
- [ ] Add state transitions and error handling
- [ ] Add conversation examples for training
- [ ] Test full conversation flow

**Acceptance Criteria**:
- [ ] Registration triggered by invitation link or `/register` with code
- [ ] Each state validates input before transition
- [ ] GitHub verification required, wallet address optional
- [ ] Reputation score calculated and displayed
- [ ] Error messages helpful and guide user forward
- [ ] Conversation tone matches kukulcán personality
- [ ] State persisted across messages

**Files**:
- `src/plugins/communityDirectory/actions/register.ts`
- `src/plugins/communityDirectory/utils/registrationStateMachine.ts`

---

#### Ticket CD-202: Build GitHubVerificationService
**Points**: 5
**Description**: Create service to verify GitHub profiles and collect activity data

**Tasks**:
- [ ] Create `GitHubVerificationService` class extending ElizaOS Service
- [ ] Implement `verifyGitHubUsername(username)` method
- [ ] Implement `getGitHubProfile(username)` method using GitHub API
- [ ] Implement `getGitHubStats(username)` method (repos, followers, stars)
- [ ] Handle GitHub API rate limiting
- [ ] Handle invalid usernames gracefully
- [ ] Cache GitHub API responses
- [ ] Add unit tests

**Acceptance Criteria**:
- [ ] Service validates GitHub username exists
- [ ] Collects: public_repos, followers, total_stars, contributions
- [ ] Stores raw profile data in JSONB field
- [ ] Handles rate limiting gracefully
- [ ] Unit tests >80% coverage

**Files**:
- `src/plugins/communityDirectory/services/GitHubVerificationService.ts`
- `src/plugins/communityDirectory/utils/githubApi.ts`
- `src/plugins/communityDirectory/__tests__/githubVerification.test.ts`

---

#### Ticket CD-203: Build ReputationService
**Points**: 3
**Description**: Calculate reputation score from GitHub activity metrics

**Tasks**:
- [ ] Create `ReputationService` class extending ElizaOS Service
- [ ] Implement basic reputation formula
- [ ] Implement `calculateGitHubReputation(githubData)` method
- [ ] Store calculation formula in config
- [ ] Add reputation tier classification
- [ ] Handle edge cases (new accounts, deleted repos)
- [ ] Add unit tests with examples

**Acceptance Criteria**:
- [ ] Formula: `(repos × 5) + (followers × 3) + (stars × 2) + (contributions × 1)`
- [ ] Returns integer reputation score
- [ ] Classifies into tiers (Novice, Contributor, Active, Experienced, Expert)
- [ ] Formula configurable for future adjustments
- [ ] Unit tests cover all tiers

**Files**:
- `src/plugins/communityDirectory/services/ReputationService.ts`
- `src/plugins/communityDirectory/utils/reputationCalculator.ts`
- `src/plugins/communityDirectory/__tests__/reputation.test.ts`

---

#### Ticket CD-204: Create Member Profile Creation
**Points**: 5
**Description**: Member profile creation and status management

**Tasks**:
- [ ] Create member profile creation function
- [ ] Store GitHub username, verification status, profile data
- [ ] Store calculated reputation score
- [ ] Store optional wallet address (no verification)
- [ ] Implement status transitions (not_member → pending → active)
- [ ] Add database transaction handling
- [ ] Add rollback on errors
- [ ] Add unit tests

**Acceptance Criteria**:
- [ ] Member profile created with all GitHub data
- [ ] Reputation score stored correctly
- [ ] Status transitions work correctly
- [ ] Transactions handle failures gracefully
- [ ] Unit tests cover happy path and errors

**Files**:
- `src/plugins/communityDirectory/actions/register.ts` (profile creation logic)
- `src/plugins/communityDirectory/__tests__/profileCreation.test.ts`

---

#### Ticket CD-205: Add GitHub API Utilities
**Points**: 3
**Description**: GitHub API helper functions and rate limit handling

**Tasks**:
- [ ] Create GitHub API client wrapper
- [ ] Implement rate limit detection
- [ ] Implement retry logic with exponential backoff
- [ ] Add caching layer for API responses
- [ ] Handle authentication (optional PAT)
- [ ] Add error handling for common cases
- [ ] Add unit tests

**Acceptance Criteria**:
- [ ] All GitHub API calls go through wrapper
- [ ] Rate limiting handled gracefully
- [ ] Caching reduces API calls
- [ ] Clear error messages for failures
- [ ] Unit tests mock API responses

**Files**:
- `src/plugins/communityDirectory/utils/githubApi.ts`
- `src/plugins/communityDirectory/__tests__/githubApi.test.ts`

---

#### Ticket CD-206: Implement Profile Edit Action
**Points**: 3
**Description**: Members can update their profiles after registration

**Tasks**:
- [ ] Create `editProfileAction`
- [ ] Allow editing: name, role, organization, country, wallet (optional)
- [ ] Lock editing: telegram_id, telegram_username, github_username
- [ ] Validate input before updates
- [ ] Add conversation flow for editing
- [ ] Add confirmation before saving
- [ ] Test profile edit flow

**Acceptance Criteria**:
- [ ] Members can edit allowed fields
- [ ] Locked fields cannot be changed
- [ ] Changes persisted to database
- [ ] Confirmation message shows updated profile
- [ ] Error handling for invalid inputs

**Files**:
- `src/plugins/communityDirectory/actions/editProfile.ts`

---

#### Ticket CD-207: Create Welcome Message Flow
**Points**: 1
**Description**: Welcome message with GitHub stats and reputation

**Tasks**:
- [ ] Create welcome message template
- [ ] Include GitHub profile link
- [ ] Display reputation score and tier
- [ ] Show member ID and status
- [ ] Add next steps guidance
- [ ] Test welcome message rendering

**Acceptance Criteria**:
- [ ] Welcome message includes GitHub stats
- [ ] Reputation tier displayed
- [ ] Message tone matches kukulcán personality
- [ ] Next steps clear and actionable

**Files**:
- `src/plugins/communityDirectory/actions/register.ts` (completion state)

---

#### Ticket CD-208: Add Unit Tests for Registration
**Points**: 2
**Description**: Comprehensive unit tests for registration flow

**Tasks**:
- [ ] Test invitation validation
- [ ] Test profile data collection
- [ ] Test GitHub verification (mocked API)
- [ ] Test reputation calculation
- [ ] Test member profile creation
- [ ] Test error handling
- [ ] Test state transitions

**Acceptance Criteria**:
- [ ] >80% test coverage for registration flow
- [ ] All happy paths tested
- [ ] All error paths tested
- [ ] Mocked GitHub API responses

**Files**:
- `src/plugins/communityDirectory/__tests__/registration.test.ts`

---

Due to length constraints, Sprint 3 tickets (CD-301 to CD-407) follow the same detailed structure. The implementation plan maintains consistency across all tickets with:
- Description
- Tasks checklist
- Acceptance criteria
- Files to create/modify
- Testing procedures

---

## 📊 Story Point Breakdown

### Sprint 1 (21 points)
- CD-101: Database Migrations (5 pts)
- CD-102: Plugin Structure (3 pts)
- CD-103: InvitationService (5 pts)
- CD-104: Telegram `/invite` Command (3 pts)
- CD-105: Web UI for Invitations (3 pts)
- CD-106: Expiration Cron Job (2 pts)

### Sprint 2 (27 points) - **Updated for GitHub verification**
- CD-201: Registration State Machine (8 pts)
- CD-202: GitHubVerificationService (5 pts) - **Changed from wallet verification**
- CD-203: ReputationService (3 pts) - **New ticket**
- CD-204: Member Profile Creation (5 pts)
- CD-205: GitHub API Utilities (3 pts) - **Changed from wallet utils**
- CD-206: Profile Edit Action (3 pts)
- CD-207: Welcome Message Flow (1 pt)
- CD-208: Unit Tests (2 pts) - **Renumbered, +1 pt for GitHub tests**

### Sprint 3 (28 points)
- CD-301: DirectoryService (5 pts)
- CD-302: Directory Web UI (5 pts)
- CD-303: Pagination (2 pts)
- CD-304: ParticipationTrackingService (5 pts)
- CD-305: Serena MCP Integration (3 pts)
- CD-306: Participation Listener (3 pts)
- CD-307: Manager Query Interface (2 pts)
- CD-308: Member Profile Pages (2 pts)
- CD-309: E2E Tests (1 pt)

**Total**: 76 story points (+1 from GitHub verification update)

---

## 🔄 Daily Standup Format

**What did I complete yesterday?**
- [Ticket ID]: Brief description

**What am I working on today?**
- [Ticket ID]: Brief description

**Any blockers?**
- Dependency waiting: [Ticket ID]
- Technical question: [Description]
- Need help with: [Area]

---

## ✅ Definition of Done (Per Ticket)

- [ ] Code written and follows project style guide
- [ ] TypeScript compilation successful with no errors
- [ ] Unit tests written with >80% coverage
- [ ] E2E tests written for user-facing features
- [ ] Code reviewed by at least one team member
- [ ] Documentation updated (inline comments, README)
- [ ] Tested in development environment
- [ ] No console errors or warnings
- [ ] Acceptance criteria met
- [ ] Ticket moved to "Done" in project board

---

## 🎯 Sprint Goals

### Sprint 1 Goal
"Community Managers can create and manage member invitations with 3-day expiration"

### Sprint 2 Goal
"Invited users can complete registration with wallet verification and become active members"

### Sprint 3 Goal
"Members can browse directory with search/filter, and managers can track engagement and send bulk messages"

---

## 📈 Progress Tracking

### Sprint Burndown
Track story points completed per day:
- Day 1: X points completed
- Day 2: X points completed
- ...
- Day 10: Sprint complete

### Velocity
- Sprint 1: 21 points (2 weeks)
- Sprint 2: 26 points (2 weeks)
- Sprint 3: 28 points (2 weeks)
- Average: 12.5 points/week

---

## 🚨 Risk Mitigation

### Technical Risks
1. **Wallet signature verification complexity**
   - Mitigation: Start CD-202 early, allocate extra time
   - Fallback: Manual verification by managers

2. **Serena MCP integration learning curve**
   - Mitigation: Study ElizaOS memory docs, allocate R&D time
   - Fallback: Use standard PostgreSQL tables

3. **Telegram bot conversation state management**
   - Mitigation: Use ElizaOS conversation state utilities
   - Fallback: Simplify to single-message registration

### Process Risks
1. **Scope creep from "Should Have" features**
   - Mitigation: Strict MoSCoW adherence, defer to post-MVP

2. **Testing time underestimation**
   - Mitigation: 1 point per ticket for testing, explicit test tickets

---

## 📚 Resources

### Documentation
- [ElizaOS Plugin Guide](https://elizaos.github.io/eliza/docs/core/plugins/)
- [ElizaOS Memory System](https://elizaos.github.io/eliza/docs/core/memory/)
- [Serena MCP Documentation](https://github.com/Dicklesworthstone/serena)
- [ethers.js Signature Verification](https://docs.ethers.org/v6/api/crypto/)

### Design Assets
- Figma: Member Directory UI mockups
- Color Palette: Frutero brand colors
- Icons: Lucide React icon library

### API References
- Telegram Bot API: https://core.telegram.org/bots/api
- Avalanche RPC: https://docs.avax.network/apis/avalanchego/apis/c-chain

---

## 🎉 Success Criteria

### Sprint 1 Complete When:
- [ ] Managers can create invitations via Telegram and web UI
- [ ] Invitation codes work and expire after 3 days
- [ ] All 6 tickets completed and tested

### Sprint 2 Complete When:
- [ ] Users can complete registration from invitation
- [ ] Wallet verification working with real signatures
- [ ] Members can edit profiles after registration

### Sprint 3 Complete When:
- [ ] Directory accessible with search and filtering
- [ ] Participation tracking active in Telegram
- [ ] Managers can send bulk messages to filtered members

### Epic Complete When:
- [ ] All 3 sprints complete
- [ ] 100+ members can use system
- [ ] All E2E tests passing
- [ ] Documentation complete
- [ ] Production deployment successful

---

**Next Steps**: Review implementation plan → Assign tickets → Start Sprint 1
