# Epic 1: Community Directory

**Epic Owner**: Product Team
**Target Audience**: Frutero Community Managers & Members
**Timeline**: 3 Sprints (6 weeks)
**Status**: Draft
**Version**: 1.0
**Date**: 2024-12-04

---

## 📖 Epic Overview

### Vision
Create a member management system that enables Frutero Community Managers to build and nurture a high-quality, engaged community through invite-only registration, rich member profiles, intelligent filtering, and AI-powered interaction memory.

### Business Goals
- Build a curated community of 100+ verified members
- Enable targeted communication based on member attributes
- Track member engagement and growth over time
- Establish foundation for future reputation and rewards systems

### Success Criteria
- [ ] Managers can send and manage invitations
- [ ] Members can complete registration with wallet verification
- [ ] Directory supports 100+ members with search and filtering
- [ ] Agent tracks member participation and highlights
- [ ] Managers can send bulk messages to filtered member groups

---

## 👥 User Stories

### US1: Member Registration
**As** a member of the Extended Community
**I want to** register as a Frutero Club member using an invitation
**So that** I can have my profile featured in the directory and participate in the community

**Acceptance Criteria:**
- [ ] Registration requires valid invitation code
- [ ] Registration flow collects: name, role, organization, country, GitHub username, wallet address (optional)
- [ ] GitHub profile verified and activity data collected
- [ ] Basic reputation score calculated from GitHub activity
- [ ] Member status transitions: Not a Member → Pending → Active
- [ ] Member receives welcome message upon completion
- [ ] Profile is editable after registration (except Telegram and GitHub identifiers)

---

### US2: Directory & Filtering
**As** a Community Manager
**I want to** filter Community Members by professional profile
**So that** I can make targeted communication and match opportunities

**Acceptance Criteria:**
- [ ] Directory accessible to members only
- [ ] Search by name, username, organization, GitHub username
- [ ] Filter by role and reputation score (GitHub-based)
- [ ] Pagination supports 100+ members
- [ ] Results display member cards with key information and GitHub profile link

---

### US3: Invitation System
**As** a Community Manager
**I want to** extend invitations to people from the Extended Community
**So that** they can register as Community Members

**Acceptance Criteria:**
- [ ] Only Community Managers can send invitations
- [ ] Invitation includes standard message + onboarding instructions
- [ ] Invitations expire after 3 days
- [ ] Track invitation status (pending, accepted, expired)
- [ ] Track who invited whom for future attribution

---

### US4: Agent Memory
**As** the Community Agent (kukulcán)
**I want to** store memories related to Community Members
**So that** I can keep track of interactions and growth within the Community

**Acceptance Criteria:**
- [ ] Track member participation in Telegram group
- [ ] Store daily highlights (achievements, learnings, challenges)
- [ ] Community Managers can query memories through agent
- [ ] Memories follow ElizaOS retention standards
- [ ] Custom MemberRelationships table stores community-specific data

---

## 🎯 Features Breakdown (MoSCoW)

### Must Have (MVP - Sprints 1-3)

#### 1. Invitation Management
- **Description**: Community Managers can create and manage member invitations
- **Components**:
  - Generate unique invitation codes
  - Set 3-day expiration
  - View invitation status (pending/accepted/expired)
  - Cancel unexpired invitations
- **Database**: `community_invitations` table
- **API Actions**: `CREATE_INVITATION`, `VIEW_INVITATIONS`, `CANCEL_INVITATION`

#### 2. Registration Flow
- **Description**: Invited users complete conversational registration via kukulcán
- **Components**:
  - Validate invitation code
  - Collect profile data (name, role, org, country)
  - Request GitHub username (required)
  - Verify GitHub profile and collect activity data
  - Calculate basic reputation score from GitHub
  - Optional: Collect wallet address (no verification in MVP)
  - Create member profile
  - Transition status (Not a Member → Pending → Active)
- **Database**: `community_members` table
- **API Actions**: `REGISTER_MEMBER`, `VERIFY_GITHUB`, `CALCULATE_REPUTATION`, `UPDATE_STATUS`

#### 3. Member Directory
- **Description**: Members-only directory with search and filtering
- **Components**:
  - Member list view with cards (include GitHub profile link)
  - Search by: name, username, organization, GitHub username
  - Filter by: role, reputation score (GitHub-based)
  - Pagination (20 members per page)
  - Member detail view with GitHub stats
- **Routes**: `/directory`, `/directory/member/:id`
- **API Actions**: `LIST_MEMBERS`, `SEARCH_MEMBERS`, `FILTER_MEMBERS`

#### 4. Member Status Lifecycle
- **Description**: Manage member states throughout their journey
- **States**:
  - `not_member` - Default for Extended Community
  - `pending` - Registered, awaiting activation
  - `active` - Full member access
  - `suspended` - Temporarily restricted
  - `banned` - Permanently removed
- **Transitions**:
  - Community Manager can change any status
  - Automatic: `not_member` → `pending` (on registration)
  - Manual: `pending` → `active` (manager approval)
- **Database**: `status` field in `community_members`

#### 5. Participation Tracking
- **Description**: Agent tracks member engagement in Telegram
- **Components**:
  - Capture message participation
  - Track reactions and interactions
  - Store participation events with context
  - Query participation history
- **Database**: `member_participation`, `member_relationships`
- **API Actions**: `TRACK_PARTICIPATION`, `QUERY_PARTICIPATION`

#### 6. Profile Management
- **Description**: Members can update their profiles
- **Editable Fields**: name, role, organization, country, wallet_address (optional)
- **Locked Fields**: telegram_id, telegram_username, github_username, member_id
- **Verification**: Re-verify GitHub if username changed (Should Have)
- **API Actions**: `UPDATE_PROFILE`, `UPDATE_GITHUB`

#### 7. Bulk Messaging
- **Description**: Managers send messages to filtered member groups
- **Components**:
  - Apply directory filters to create recipient list
  - Preview recipient count before sending
  - Send message via Telegram bot
  - Track message delivery status
- **API Actions**: `SEND_BULK_MESSAGE`, `PREVIEW_RECIPIENTS`

---

### Should Have (Post-MVP Enhancement)

#### 8. Registration Fee
- **Description**: Optional 0.25 USDC registration fee, waivable by managers
- **Components**:
  - x402 payment integration
  - Fee collection to community treasury
  - Manager waiver override
  - Payment status tracking
- **Database**: `registration_fee_paid`, `registration_fee_tx_hash` fields
- **Dependency**: x402 SDK integration (separate epic)

#### 9. Daily Highlights
- **Description**: Agent stores member daily achievements and learnings
- **Components**:
  - Prompt members for daily highlights
  - Categorize: achievement, learning, challenge
  - Store with date and context
  - Query highlights for growth tracking
- **Database**: `member_daily_highlights` table
- **API Actions**: `RECORD_HIGHLIGHT`, `QUERY_HIGHLIGHTS`

#### 10. Wallet Signature Verification
- **Description**: Verify wallet ownership via EVM signature
- **Components**:
  - Request wallet signature during registration or profile update
  - Validate signature using ethers.js
  - Support Avalanche C-Chain and other EVM chains
  - Store verification status and timestamp
- **Database**: `wallet_verified`, `wallet_verified_at` fields
- **Dependency**: ethers.js, Avalanche RPC

#### 11. Advanced Reputation Validation
- **Description**: Expand reputation scoring with additional data sources
- **Sources**:
  - Onchain: ENS, NFTs, ERC20 tokens, POAPs, attestations
  - Off-chain: Passport.xyz, Talent Protocol, advanced GitHub metrics
- **Components**:
  - Integration with reputation APIs
  - Calculate composite reputation score from multiple sources
  - Display reputation badges and tier levels
- **Database**: `reputation_sources` JSONB
- **Dependency**: External API integrations

#### 12. Invitation Attribution
- **Description**: Track who invited whom for rewards and network analysis
- **Components**:
  - Store inviter-invitee relationships
  - Display invitation tree/network
  - Calculate invitation impact score
- **Database**: `invited_by` field in `community_members`
- **Visualization**: Invitation network graph

---

### Could Have (Future Epics)

#### 13. Agent Review Workflow
- **Description**: kukulcán reviews registrations before manager approval
- **Components**:
  - Agent analyzes GitHub and off-chain data
  - Generates recommendation (approve/review/reject)
  - Manager makes final decision
- **Future Epic**: Community Reputation Score

#### 14. Member Vouching System
- **Description**: Active members can invite others (vouching)
- **Components**:
  - Earn invitation privileges through engagement
  - Invitation quotas per member
  - Reputation impact based on invitee behavior
- **Future Epic**: Member Rewards & Recognition

#### 15. Member Growth Tracker
- **Description**: Track member goals, projects, and progress
- **Components**:
  - Goal setting and milestone tracking
  - Project task management
  - Challenge identification and resolution
  - Growth visualization dashboard
- **Future Epic**: Member Development & Mentorship

#### 16. Custom Token Verification
- **Description**: Managers configure required tokens/NFTs for registration
- **Components**:
  - Token/NFT configuration UI
  - Custom balance thresholds
  - Multiple token requirements
  - Verification service integration
- **Future Epic**: Advanced Verification & Access Control

---

### Won't Have (Explicitly Out of Scope)

- Email verification (trust Telegram data)
- GDPR compliance features (data deletion, export, audit logs)
- Profile completion checklist
- Community guidelines acceptance flow
- Member view/delete interaction history
- Public directory access
- Profile visibility controls (public/private)

---

## 🏗️ Technical Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frutero Community Agent                  │
│                        (kukulcán - k7)                       │
└─────────────────────────────────────────────────────────────┘
                              │
                ┌─────────────┼─────────────┐
                │             │             │
        ┌───────▼──────┐ ┌───▼────────┐ ┌─▼────────────┐
        │   Telegram   │ │  Web UI    │ │ Manager API  │
        │   Bot Plugin │ │ (Directory)│ │  (Admin)     │
        └───────┬──────┘ └───┬────────┘ └─┬────────────┘
                │            │             │
        ┌───────▼────────────▼─────────────▼──────────┐
        │     Community Directory Plugin               │
        │  ┌──────────────────────────────────────┐   │
        │  │ Actions:                              │   │
        │  │ - register, invite, directory         │   │
        │  │ - track_participation, bulk_message   │   │
        │  └──────────────────────────────────────┘   │
        │  ┌──────────────────────────────────────┐   │
        │  │ Services:                             │   │
        │  │ - InvitationService                   │   │
        │  │ - VerificationService (wallet sig)    │   │
        │  │ - ParticipationTrackingService        │   │
        │  │ - DirectoryService                    │   │
        │  └──────────────────────────────────────┘   │
        │  ┌──────────────────────────────────────┐   │
        │  │ Providers:                            │   │
        │  │ - MemberProfileProvider               │   │
        │  │ - MemberEngagementProvider            │   │
        │  └──────────────────────────────────────┘   │
        └────────────────┬─────────────────────────────┘
                         │
        ┌────────────────▼─────────────────────────────┐
        │         PostgreSQL Database                   │
        │  ┌──────────────────────────────────────┐    │
        │  │ Tables:                               │    │
        │  │ - community_invitations               │    │
        │  │ - community_members                   │    │
        │  │ - member_relationships (Serena MCP)   │    │
        │  │ - member_participation                │    │
        │  │ - member_daily_highlights             │    │
        │  └──────────────────────────────────────┘    │
        └────────────────┬─────────────────────────────┘
                         │
        ┌────────────────▼─────────────────────────────┐
        │      External Integrations                    │
        │  - Avalanche C-Chain (wallet verification)    │
        │  - ethers.js (EVM signature validation)       │
        │  - Serena MCP (memory management)             │
        │  - x402 SDK (future: registration fees)       │
        └───────────────────────────────────────────────┘
```

### Plugin Architecture

**Location**: `src/plugins/communityDirectory/`

```
communityDirectory/
├── index.ts                  # Plugin export
├── actions/
│   ├── register.ts          # Registration flow (US1)
│   ├── invite.ts            # Invitation management (US3)
│   ├── directory.ts         # Directory queries (US2)
│   ├── trackParticipation.ts # Participation tracking (US4)
│   └── bulkMessage.ts       # Bulk messaging
├── services/
│   ├── InvitationService.ts # Invitation CRUD
│   ├── GitHubVerificationService.ts # GitHub profile verification
│   ├── ReputationService.ts # Reputation score calculation
│   ├── ParticipationService.ts # Engagement tracking
│   └── DirectoryService.ts  # Member search/filter
├── providers/
│   ├── memberProfile.ts     # Inject member context
│   └── memberEngagement.ts  # Inject participation data
├── types/
│   ├── member.ts            # Member interfaces
│   ├── invitation.ts        # Invitation interfaces
│   └── memory.ts            # Memory interfaces
├── utils/
│   ├── validation.ts        # Input validation
│   ├── formatting.ts        # Data formatting
│   ├── githubApi.ts         # GitHub API helpers
│   └── reputationCalculator.ts # Reputation score formulas
└── routes/
    ├── directory.ts         # GET /api/directory
    ├── member.ts            # GET /api/member/:id
    └── invitation.ts        # POST /api/invitation
```

---

## 🗄️ Database Schema

### 1. community_invitations

```sql
CREATE TABLE community_invitations (
  invitation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invitation_code VARCHAR(32) UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES community_members(member_id),
  invited_telegram_username VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, accepted, expired, cancelled
  expires_at TIMESTAMP NOT NULL,
  accepted_by UUID REFERENCES community_members(member_id),
  accepted_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_invitation_code ON community_invitations(invitation_code);
CREATE INDEX idx_invitation_status ON community_invitations(status);
CREATE INDEX idx_invitation_created_by ON community_invitations(created_by);
```

### 2. community_members

```sql
CREATE TABLE community_members (
  member_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  telegram_id VARCHAR(255) UNIQUE NOT NULL,
  telegram_username VARCHAR(255) UNIQUE NOT NULL,

  -- Profile Data
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100) NOT NULL, -- student, developer, designer, researcher, etc.
  organization VARCHAR(255),
  country VARCHAR(100),

  -- GitHub Verification (MVP - Must Have)
  github_username VARCHAR(255) UNIQUE NOT NULL,
  github_verified BOOLEAN DEFAULT FALSE,
  github_verified_at TIMESTAMP,
  github_profile_data JSONB DEFAULT '{}', -- Store GitHub profile data

  -- Wallet (Optional in MVP)
  wallet_address VARCHAR(42), -- Optional, no verification in MVP
  wallet_verified BOOLEAN DEFAULT FALSE, -- For future wallet verification
  wallet_verified_at TIMESTAMP,

  -- Status & Reputation
  status VARCHAR(20) NOT NULL DEFAULT 'not_member', -- not_member, pending, active, suspended, banned
  reputation_score INTEGER DEFAULT 0, -- Calculated from GitHub activity

  -- Attribution & Fees
  invited_by UUID REFERENCES community_members(member_id),
  registration_fee_paid BOOLEAN DEFAULT FALSE,
  registration_fee_tx_hash VARCHAR(66),

  -- Flexible Data
  profile_data JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_member_telegram_id ON community_members(telegram_id);
CREATE INDEX idx_member_github_username ON community_members(github_username);
CREATE INDEX idx_member_status ON community_members(status);
CREATE INDEX idx_member_role ON community_members(role);
CREATE INDEX idx_member_reputation ON community_members(reputation_score DESC);
```

### 3. member_relationships (Serena MCP Integration)

```sql
CREATE TABLE member_relationships (
  relationship_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES community_members(member_id) ON DELETE CASCADE,
  agent_id VARCHAR(255) NOT NULL DEFAULT 'kukulcan',

  -- Relationship Classification
  relationship_type VARCHAR(50) NOT NULL, -- participation, daily_highlight, milestone

  -- Content & Context
  content JSONB NOT NULL, -- Flexible storage for relationship data
  context TEXT, -- Additional context for LLM consumption

  -- Temporal
  occurred_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_relationship_member ON member_relationships(member_id);
CREATE INDEX idx_relationship_type ON member_relationships(relationship_type);
CREATE INDEX idx_relationship_occurred ON member_relationships(occurred_at DESC);
CREATE INDEX idx_relationship_content ON member_relationships USING GIN(content);
```

### 4. member_participation

```sql
CREATE TABLE member_participation (
  participation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES community_members(member_id) ON DELETE CASCADE,

  -- Participation Details
  participation_type VARCHAR(50) NOT NULL, -- message, reaction, action
  telegram_message_id BIGINT,
  content_summary TEXT,

  -- Temporal
  occurred_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_participation_member ON member_participation(member_id);
CREATE INDEX idx_participation_occurred ON member_participation(occurred_at DESC);
```

### 5. member_daily_highlights (Should Have)

```sql
CREATE TABLE member_daily_highlights (
  highlight_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES community_members(member_id) ON DELETE CASCADE,

  -- Highlight Details
  highlight_type VARCHAR(50) NOT NULL, -- achievement, learning, challenge
  description TEXT NOT NULL,
  date DATE NOT NULL,

  -- Temporal
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_highlight_member ON member_daily_highlights(member_id);
CREATE INDEX idx_highlight_date ON member_daily_highlights(date DESC);
CREATE INDEX idx_highlight_type ON member_daily_highlights(highlight_type);
```

---

## 📐 GitHub Reputation Calculation (MVP)

### Basic Reputation Formula

**Purpose**: Calculate initial reputation score from public GitHub activity

**Formula**:
```
reputation_score =
  (public_repos × 5) +
  (followers × 3) +
  (total_stars_received × 2) +
  (contributions_last_year × 1)
```

**Metrics Collected** (from GitHub API):
- `public_repos`: Number of public repositories
- `followers`: Number of GitHub followers
- `total_stars_received`: Sum of stars across all repos
- `contributions_last_year`: Contribution count from profile

**Example Calculation**:
```typescript
// User with: 15 repos, 50 followers, 200 total stars, 500 contributions
reputation_score = (15 × 5) + (50 × 3) + (200 × 2) + (500 × 1)
                 = 75 + 150 + 400 + 500
                 = 1,125 points
```

**Reputation Tiers** (for future filtering):
- **Novice**: 0-100 points
- **Contributor**: 101-500 points
- **Active Developer**: 501-1,000 points
- **Experienced**: 1,001-2,500 points
- **Expert**: 2,501+ points

**Data Storage**:
- `reputation_score`: INTEGER field in `community_members`
- `github_profile_data`: JSONB field storing raw GitHub API response
- Updated during registration and can be refreshed manually

**Future Enhancements** (Sprint 5):
- Language expertise (TypeScript, Python, etc.)
- Open source contribution quality (PR acceptance rate)
- Repository maintenance (commit recency, issue response time)
- Community engagement (discussions, code reviews)

---

## 🔗 Integration Points

### ElizaOS Core
- **Memory System**: Extend ElizaOS memory with `member_relationships` table
- **Plugin System**: Register as ElizaOS plugin with actions, services, providers
- **Runtime**: Access to IAgentRuntime for state management

### Telegram Plugin
- **Bot Commands**: `/register`, `/invite`, `/directory`, `/profile`
- **Conversation State**: Multi-step registration flow
- **Message Handling**: Participation tracking in group chats
- **Bulk Messaging**: Send to filtered member lists

### Serena MCP
- **Memory Management**: Store and query member relationships
- **Session Persistence**: Cross-session member context
- **Query Interface**: Managers query member memories through agent

### GitHub API (MVP - Must Have)
- **Endpoint**: `https://api.github.com`
- **Authentication**: GitHub Personal Access Token (optional for higher rate limits)
- **Profile Verification**: Validate username exists and is active
- **Activity Data**: Fetch public repos, followers, stars, contributions
- **Reputation Calculation**: Basic formula from GitHub metrics

### Avalanche C-Chain (Should Have)
- **RPC Endpoint**: `https://api.avax.network/ext/bc/C/rpc`
- **Chain ID**: 43114 (mainnet), 43113 (Fuji testnet)
- **Wallet Verification**: EVM signature validation via ethers.js (post-MVP)
- **Future**: Token/NFT balance checks for advanced reputation

### x402 SDK (Should Have)
- **Registration Fees**: 0.25 USDC payment
- **Treasury Integration**: Payments to community wallet
- **Transaction Tracking**: Store tx_hash for verification
- **Future Epic**: Paid directory access

---

## 📋 Implementation Phases

### Phase 1: Foundation (Sprint 1 - Weeks 1-2)

**Goal**: Database setup and invitation system

**Tasks**:
1. Create database migrations for all tables
2. Set up ElizaOS plugin structure (`src/plugins/communityDirectory/`)
3. Define TypeScript interfaces (types/)
4. Implement InvitationService
5. Create CRUD actions for invitations
6. Build manager invitation UI (web route)
7. Add invitation expiration cron job

**Deliverables**:
- [ ] Database schema deployed
- [ ] Invitation management working end-to-end
- [ ] Managers can create/view/cancel invitations

**Tickets**:
- `CD-101`: Create database migrations for community tables
- `CD-102`: Set up plugin structure and TypeScript interfaces
- `CD-103`: Implement InvitationService with CRUD operations
- `CD-104`: Create Telegram bot command `/invite`
- `CD-105`: Build web UI for invitation management
- `CD-106`: Add invitation expiration cron job

---

### Phase 2: Registration & Verification (Sprint 2 - Weeks 3-4)

**Goal**: Member registration flow with GitHub verification

**Tasks**:
1. Implement registration action with conversation state machine
2. Build GitHubVerificationService for profile validation
3. Build ReputationService for GitHub-based scoring
4. Create member profile creation logic
5. Implement status lifecycle transitions
6. Add GitHub API utilities
7. Build registration confirmation flow
8. Create profile management actions

**Deliverables**:
- [ ] Registration flow complete (invitation → profile → GitHub → reputation → welcome)
- [ ] GitHub profile verification working
- [ ] Basic reputation score calculated from GitHub activity
- [ ] Member profiles editable after registration
- [ ] Status transitions functioning

**Tickets**:
- `CD-201`: Implement registration conversation state machine
- `CD-202`: Build GitHubVerificationService for profile validation
- `CD-203`: Build ReputationService for GitHub-based scoring
- `CD-204`: Create member profile creation and status management
- `CD-205`: Add GitHub API utilities and helpers
- `CD-206`: Implement profile edit action
- `CD-207`: Create welcome message flow with GitHub stats
- `CD-208`: Add unit tests for registration flow

---

### Phase 3: Directory & Memory (Sprint 3 - Weeks 5-6)

**Goal**: Member directory with search/filter and participation tracking

**Tasks**:
1. Build DirectoryService with search/filter logic
2. Create member directory web interface
3. Implement pagination for 100+ members
4. Build ParticipationTrackingService
5. Integrate Serena MCP for memory storage
6. Create participation tracking action
7. Build manager query interface for memories
8. Add member profile detail pages

**Deliverables**:
- [ ] Directory accessible to members with search/filter
- [ ] Participation tracking active in Telegram
- [ ] Managers can query member memories
- [ ] Member detail pages with engagement data

**Tickets**:
- `CD-301`: Build DirectoryService with search and filter
- `CD-302`: Create member directory web interface
- `CD-303`: Implement pagination for large member lists
- `CD-304`: Build ParticipationTrackingService
- `CD-305`: Integrate Serena MCP for memory storage
- `CD-306`: Create participation tracking Telegram listener
- `CD-307`: Build manager memory query interface
- `CD-308`: Add member profile detail pages
- `CD-309`: Add E2E tests for directory flow

---

### Phase 4: Admin Tools (Sprint 3 - Weeks 5-6)

**Goal**: Manager tools for bulk messaging and member management

**Tasks**:
1. Implement bulk messaging action
2. Build recipient preview functionality
3. Add member status management UI
4. Create filter-to-recipients pipeline
5. Add message delivery tracking
6. Build manager dashboard
7. Add admin audit logs

**Deliverables**:
- [ ] Bulk messaging to filtered members working
- [ ] Manager dashboard with member stats
- [ ] Status management tools functional

**Tickets**:
- `CD-401`: Implement bulk messaging action
- `CD-402`: Build recipient preview and filter pipeline
- `CD-403`: Add member status management UI
- `CD-404`: Create manager dashboard with stats
- `CD-405`: Add message delivery tracking
- `CD-406`: Implement audit logging for admin actions
- `CD-407`: Add integration tests for bulk messaging

---

## 🚀 Post-MVP Enhancements

### Sprint 4: Registration Fees & Daily Highlights
- Integrate x402 SDK for 0.25 USDC registration fees
- Add manager waiver functionality
- Implement daily highlights prompts and storage
- Build highlights query interface

### Sprint 5: Wallet Verification & Advanced Reputation
- Add wallet signature verification (EVM via ethers.js)
- Integrate Passport.xyz for Sybil resistance
- Add Talent Protocol API for professional reputation
- Expand GitHub metrics (advanced contribution analysis)
- Calculate composite reputation score from multiple sources
- Display reputation badges and tier levels in directory

### Sprint 6: Attribution & Analytics
- Build invitation network visualization
- Track invitation impact scores
- Add member growth analytics
- Create engagement trend dashboards

---

## 🔮 Future Epics (Dependencies)

### Epic 2: Community Reputation Score
- **Triggers**: Post-MVP reputation validation
- **Features**: Custom scoring algorithm, badge system, tier levels
- **Dependencies**: Community Directory (Epic 1)

### Epic 3: Member Rewards & Recognition
- **Triggers**: Reputation score system
- **Features**: Automated rewards, member vouching, invitation quotas
- **Dependencies**: Community Reputation Score (Epic 2)

### Epic 4: Multi-Platform Integration
- **Triggers**: 100+ active Telegram members
- **Features**: Discord, Twitch, Kick, GitHub integration
- **Dependencies**: Community Directory (Epic 1)

### Epic 5: PerkOS Marketplace Access
- **Triggers**: x402 paid directory access
- **Features**: Service marketplace, paid analytics, data exports
- **Dependencies**: Community Directory (Epic 1), x402 integration

### Epic 6: Member Development & Mentorship
- **Triggers**: Member growth tracking
- **Features**: Goal setting, project management, mentor matching
- **Dependencies**: Community Directory (Epic 1), Reputation Score (Epic 2)

### Epic 7: Advanced Verification & Access Control
- **Triggers**: Custom token/NFT requirements
- **Features**: Token-gated access, NFT verification, role-based permissions
- **Dependencies**: Community Directory (Epic 1)

---

## 📊 Success Metrics

### Sprint 1-3 (MVP)
- **Invitation Conversion**: >60% invitation acceptance rate
- **Registration Completion**: >80% complete registration after invite acceptance
- **Directory Usage**: >50% members search/filter directory weekly
- **Participation Tracking**: 100% Telegram messages captured
- **Bulk Messaging**: <5 min to send message to 100+ members

### Post-MVP (Sprints 4-6)
- **Registration Fee Collection**: >90% fee payment success rate
- **Daily Highlights**: >40% members submit daily highlights weekly
- **Reputation Score**: >75% members with reputation >0
- **Invitation Attribution**: Track invitation network depth >3 levels

---

## 🔐 Security & Privacy

### MVP Security
- **GitHub Verification**: Profile validation prevents impersonation
- **Invitation Codes**: Cryptographically secure UUID generation
- **Role-Based Access**: Managers vs. Members vs. Extended Community
- **Status-Based Access**: Directory accessible to active members only

### Future Considerations (Post-MVP)
- **GDPR Compliance**: Data deletion, export, audit logs (Epic: Data Management)
- **Privacy Controls**: Member visibility settings (Epic: Advanced Access Control)
- **Rate Limiting**: Prevent bulk messaging abuse
- **Audit Logging**: Track all admin actions

---

## 🧪 Testing Strategy

### Unit Tests (Bun test)
- `src/plugins/communityDirectory/__tests__/`
  - `invitation.test.ts`: Invitation service CRUD
  - `registration.test.ts`: Registration flow state machine
  - `verification.test.ts`: Wallet signature validation
  - `directory.test.ts`: Search and filter logic
  - `participation.test.ts`: Participation tracking

### E2E Tests (ElizaOS test runner)
- `src/plugins/communityDirectory/__tests__/e2e/`
  - `invitation.e2e.ts`: Full invitation flow
  - `registration.e2e.ts`: Complete registration journey
  - `directory.e2e.ts`: Directory search and filter
  - `bulkMessage.e2e.ts`: Bulk messaging to filtered members

### Integration Tests (Cypress)
- `cypress/e2e/communityDirectory/`
  - `invitation-management.cy.ts`: Manager invitation UI
  - `member-directory.cy.ts`: Directory web interface
  - `member-profile.cy.ts`: Profile detail pages
  - `bulk-messaging.cy.ts`: Bulk message UI

---

## 📚 Documentation Requirements

### Developer Documentation
- [ ] Plugin architecture overview
- [ ] Database schema with ER diagrams
- [ ] API endpoints documentation
- [ ] Integration guide (Serena MCP, x402, Avalanche)
- [ ] Testing guide with examples

### User Documentation
- [ ] Manager guide: Sending invitations
- [ ] Member guide: Registration process
- [ ] Manager guide: Using directory filters
- [ ] Manager guide: Bulk messaging
- [ ] Member guide: Profile management

### Operational Documentation
- [ ] Deployment guide
- [ ] Environment configuration
- [ ] Database migration procedures
- [ ] Monitoring and alerting setup

---

## ❓ Open Questions

### Technical
1. Should we rate-limit bulk messaging to prevent abuse?
2. What's the max bulk message size (recipients)?
3. Should member participation be tracked in DMs or only group chats?
4. How do we handle wallet address changes (re-verification required)?

### Product
1. Should suspended members retain directory access?
2. Can banned members be reinstated, or is it permanent?
3. Should members be notified when their status changes?
4. Do we need a "waitlist" status for high-demand registration?

### Future
1. When should we prioritize registration fees (Sprint 4)?
2. What's the trigger for Multi-Platform Epic (Discord integration)?
3. Should reputation score be public or members-only?
4. Do we need a "founding member" status for early adopters?

---

## 🎯 Definition of Done

### Epic Complete When:
- [ ] All MVP user stories (US1-US4) accepted
- [ ] All must-have features implemented and tested
- [ ] Database migrations deployed to production
- [ ] ElizaOS plugin registered and active
- [ ] 100+ members can use directory without performance issues
- [ ] Manager documentation complete
- [ ] Member onboarding guide complete
- [ ] E2E tests passing at >90% coverage
- [ ] Security review complete (wallet verification, access control)
- [ ] Production monitoring configured

---

## 📝 Changelog

**v1.0** (2024-12-04)
- Initial epic specification
- Defined MVP scope (Sprints 1-3)
- Database schema design
- MoSCoW feature prioritization
- Implementation phases
- Post-MVP enhancement roadmap

---

## 👥 Stakeholders

**Product Owner**: Mel (Frutero Community Lead)
**Technical Lead**: To be assigned
**Community Manager**: To be assigned
**Design**: To be assigned

---

## 📖 Related Documents

- [Community Directory Original Spec](./1-community-directory-spec.md) - Initial brainstorming spec
- [PerkOS One-Pager](../perk-os/one-pager.md) - PerkOS vision document
- [kukulcán Character](../../src/character.ts) - Agent personality definition
- [ElizaOS Plugin Guide](https://elizaos.github.io/eliza/docs/core/plugins/) - Plugin development reference

---

**Note**: This epic focuses exclusively on Community Directory MVP features. Advanced analytics, multi-platform integration, automated rewards, and GDPR compliance are intentionally scoped out to future epics to maintain focus and deliverability within 3 sprints (6 weeks).
