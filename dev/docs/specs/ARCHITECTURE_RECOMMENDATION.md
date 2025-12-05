# Architecture Recommendation: Community Directory Backend

**Status**: Recommendation
**Date**: 2024-12-04
**Author**: Claude (Architecture Analysis)
**Context**: Hackathon MVP (6 weeks, 3 sprints)

## Executive Summary

**RECOMMENDATION: ElizaOS Plugin-Only Architecture (Option A)**

The Community Directory feature should be implemented entirely as an ElizaOS plugin without a separate backend service. This approach leverages ElizaOS's built-in HTTP route support, conversational AI capabilities, and direct PostgreSQL access while minimizing architectural complexity for the hackathon timeline.

### 🔑 Key Architectural Insight: Hybrid Data Strategy

**Use ElizaOS Memory for conversational data, Drizzle ORM for business data:**

| Data Type | Storage System | Why |
|-----------|---------------|-----|
| 💬 Conversation history | ElizaOS Memory | Purpose-built for AI context, semantic search, threading |
| 🤝 Relationships (inviter/invitee) | ElizaOS Memory | Automatic entity extraction, relationship graphs |
| 📝 Facts about members | ElizaOS Memory | Agent learning, contextual enrichment |
| 👤 Member profiles | Drizzle/PostgreSQL | Complex queries, filtering, pagination |
| 📊 Reputation scores | Drizzle/PostgreSQL | Numeric calculations, leaderboards |
| 🎟️ Invitations (codes, status) | Drizzle/PostgreSQL | Status tracking, expiry logic, bulk operations |

**Result**: Best of both worlds - conversational intelligence from ElizaOS + business logic optimization from PostgreSQL.

---

## Analysis Context

### Requirements Overview

The Community Directory epic requires:

1. **Conversational Registration** (US1): Telegram-based multi-turn registration flow with GitHub verification
2. **Directory Queries** (US2): REST API with filtering, search, and pagination for member profiles
3. **Invitation System** (US3): Invitation management with expiry tracking and bulk operations
4. **Agent Memory** (US4): Persistent context storage for member interactions

### ElizaOS Capabilities Assessment

**✅ Confirmed Capabilities:**
- **Actions**: Multi-turn conversational flows with state management
- **Services**: Background processes (GitHub verification, reputation calculation)
- **Routes**: HTTP endpoints with full request/response control (confirmed in `src/plugin.ts:237-248`)
- **Providers**: Context injection for agent memory
- **Database**: PostgreSQL support via `POSTGRES_URL` environment variable
- **Direct Database Access**: Plugins can import pg/Prisma/Drizzle for complex queries

**⚠️ Limitations:**
- IDatabaseAdapter abstraction (Memory, Entity, Relationship, Fact) too high-level for complex queries
- No built-in ORM or query builder (must bring your own)
- Documentation for HTTP routes is incomplete (but working code exists)

**❌ Not Designed For:**
- Traditional REST API frameworks (not Express/Fastify replacement)
- Heavy web application serving (primarily Socket.IO focused)
- Built-in authentication/authorization middleware

---

## Architecture Options Evaluated

### Option A: ElizaOS Plugin-Only ⭐ RECOMMENDED

**Description**: Implement all Community Directory features as a single ElizaOS plugin with direct PostgreSQL access.

```
src/plugins/communityDirectory/
├── actions/
│   ├── registerAction.ts          # Telegram registration flow (conversational)
│   └── inviteAction.ts            # Send invitation via chat
├── services/
│   ├── GitHubVerificationService.ts   # GitHub API integration
│   ├── ReputationService.ts           # Score calculation background job
│   └── InvitationService.ts           # Invitation expiry tracking
├── routes/
│   ├── directoryRoutes.ts         # GET /api/members?role=developer&skills=rust
│   ├── invitationRoutes.ts        # GET/POST /api/invitations
│   └── memberRoutes.ts            # GET /api/members/:id
├── providers/
│   └── MemberContextProvider.ts   # Inject member data into conversations
├── database/
│   ├── schema.sql                 # PostgreSQL schema (5 tables)
│   ├── client.ts                  # pg/Prisma client initialization
│   └── queries.ts                 # Direct SQL/ORM queries
└── types/
    └── index.ts                   # TypeScript interfaces
```

**Pros:**
- ✅ Single deployment (one codebase, one server)
- ✅ Leverages ElizaOS strengths (conversational AI + HTTP routes)
- ✅ Direct PostgreSQL access for complex queries
- ✅ Simplest architecture for hackathon timeline
- ✅ Shared database client across Actions, Routes, and Services
- ✅ No network latency between components

**Cons:**
- ⚠️ Must manage database client manually (no built-in ORM)
- ⚠️ No authentication middleware (must implement in routes)
- ⚠️ Limited HTTP framework features compared to Express/Fastify

**Implementation Strategy:**
- **Sprint 1**: Registration Action + GitHub Verification Service + Database setup
- **Sprint 2**: Directory Routes + Reputation Service + Complex queries
- **Sprint 3**: Invitation System + Frontend integration + Testing

**Risk Mitigation:**
If ElizaOS routes prove insufficient during Sprint 2 development, pivot to Option B with minimal refactoring (database schema and services remain unchanged).

---

### Option B: Hybrid (ElizaOS + Lightweight Backend)

**Description**: ElizaOS handles conversational interactions, separate Express/Fastify backend handles REST API and complex queries.

```
Repository Structure (Monorepo-like):
perk-os/                           # ElizaOS agent
├── src/plugins/communityDirectory/
│   ├── actions/                   # Telegram bot actions
│   └── services/                  # Shared services
└── ...

community-directory-api/           # Separate backend (sibling repo)
├── src/
│   ├── routes/                    # REST API endpoints
│   ├── services/                  # Business logic
│   └── database/                  # Prisma/Drizzle setup
└── package.json
```

**Pros:**
- ✅ Right tool for each job (ElizaOS for chat, Express for API)
- ✅ Full Express/Fastify ecosystem (middleware, auth, validation)
- ✅ Proper ORM with migrations (Prisma/Drizzle)
- ✅ Easier to scale API separately

**Cons:**
- ❌ Two deployments to manage
- ❌ More complex dev environment (two servers)
- ❌ Schema coordination between services
- ❌ Network calls add latency (if ElizaOS calls backend)
- ❌ Potential data consistency issues

**When to Consider:**
- ElizaOS route limitations discovered during development
- Need advanced HTTP features (rate limiting, complex auth)
- Future requirement for separate API versioning/scaling

---

### Option C: Full Separation (ElizaOS + NestJS Backend)

**Description**: ElizaOS only provides conversational personality, all business logic in separate backend.

**Assessment**: ❌ **Too Heavy for Hackathon MVP**

This architecture provides maximum separation but:
- Requires most development overhead
- ElizaOS must call backend via HTTP for all operations
- Network latency between components
- Overkill for 6-week MVP scope
- Better suited for production post-MVP

---

## Detailed Recommendation: Option A Implementation

### Database Access Pattern: Hybrid Strategy

**IMPORTANT**: Use different data access patterns for different data types:

#### 1. Agent Interactions & Conversations → ElizaOS Memory System

**Use ElizaOS's built-in Memory module for:**
- ✅ Conversation history (multi-turn registration dialogs)
- ✅ Agent interactions with members
- ✅ Context tracking across sessions
- ✅ Relationship tracking (who invited whom)
- ✅ Facts about members (what the agent learned)

```typescript
// Use IAgentRuntime's built-in memory operations
await runtime.createMemory({
  type: MemoryType.MESSAGE,
  content: { text: "User registered with GitHub username: melMel" },
  roomId: message.roomId,
  userId: message.userId,
});

// Search conversation history
const previousInteractions = await runtime.searchMemories(
  "registration conversation",
  10 // limit
);

// Store facts about members
await runtime.createFact({
  content: "melMel is interested in AI agents and web3",
  entityId: memberId,
  source: "registration-conversation",
});
```

**Why use ElizaOS Memory?**
- ✅ Purpose-built for conversational AI context
- ✅ Automatic entity and relationship extraction
- ✅ Vector embeddings for semantic search
- ✅ Built-in conversation threading
- ✅ No additional database setup required

#### 2. Business Data (Directory, Invitations) → Drizzle ORM

**Use Drizzle ORM with direct PostgreSQL for:**
- ✅ Member profiles (structured data)
- ✅ Directory queries (complex filtering, pagination)
- ✅ Invitation management (status, expiry, codes)
- ✅ Reputation scores (numeric calculations)
- ✅ Analytics aggregations

```typescript
// src/plugins/communityDirectory/database/client.ts
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL,
});

export const db = drizzle(pool);
```

**Why use Drizzle for business data?**
- ✅ Lightweight (perfect for plugin environment)
- ✅ Type-safe queries with TypeScript
- ✅ SQL-like syntax (complex JOINs, aggregations)
- ✅ No code generation required (faster iteration)
- ✅ Optimized for structured business logic queries

#### 3. Data Flow Example: Registration

```typescript
// Step 1: Store conversation in ElizaOS Memory
await runtime.createMemory({
  type: MemoryType.MESSAGE,
  content: { text: "What's your GitHub username?" },
  roomId: message.roomId,
  userId: agentId,
});

// Step 2: Create member profile in business database
await db.insert(communityMembers).values({
  telegram_id: message.userId,
  github_username: username,
  primary_role: role,
});

// Step 3: Create relationship fact in ElizaOS Memory
await runtime.createRelationship({
  entityIdA: inviterId, // Who invited them
  entityIdB: newMemberId, // New member
  type: "INVITED",
  metadata: { invitationCode: code },
});
```

**Data Access Decision Matrix:**

| Data Type | Storage | Reason |
|-----------|---------|--------|
| Conversation history | ElizaOS Memory | Conversational context, semantic search |
| Member profiles | Drizzle/PostgreSQL | Complex queries, filtering, pagination |
| Relationships (who invited whom) | ElizaOS Memory | Relationship graph, automatic extraction |
| Invitations (codes, status) | Drizzle/PostgreSQL | Status tracking, expiry logic, bulk ops |
| Facts about members | ElizaOS Memory | Agent learning, contextual enrichment |
| Reputation scores | Drizzle/PostgreSQL | Numeric calculations, leaderboards |
| Analytics | Drizzle/PostgreSQL | Aggregations, reporting |

### Route Implementation Example

```typescript
// src/plugins/communityDirectory/routes/directoryRoutes.ts
import { db } from '../database/client';
import { communityMembers } from '../database/schema';
import { eq, and, like, inArray } from 'drizzle-orm';

export const directoryRoutes = [
  {
    name: "getMembers",
    path: "/api/members",
    type: "GET",
    handler: async (req: any, res: any) => {
      try {
        const { role, skills, search, page = 1, limit = 20 } = req.query;

        // Build query conditions
        const conditions = [];
        if (role) conditions.push(eq(communityMembers.primaryRole, role));
        if (search) conditions.push(like(communityMembers.name, `%${search}%`));

        // Execute query with pagination
        const offset = (page - 1) * limit;
        const members = await db
          .select()
          .from(communityMembers)
          .where(and(...conditions))
          .limit(limit)
          .offset(offset);

        // Get total count for pagination
        const [{ count }] = await db
          .select({ count: sql`count(*)` })
          .from(communityMembers)
          .where(and(...conditions));

        res.json({
          members,
          pagination: {
            page,
            limit,
            total: count,
            pages: Math.ceil(count / limit),
          },
        });
      } catch (error) {
        logger.error({ error }, "Error fetching members");
        res.status(500).json({ error: "Failed to fetch members" });
      }
    },
  },
];
```

### Service Implementation Example

```typescript
// src/plugins/communityDirectory/services/GitHubVerificationService.ts
import { Service, logger } from '@elizaos/core';
import type { IAgentRuntime } from '@elizaos/core';
import { Octokit } from '@octokit/rest';
import { db } from '../database/client';
import { communityMembers } from '../database/schema';

export class GitHubVerificationService extends Service {
  static serviceType = "github-verification";
  capabilityDescription = "Verifies GitHub profiles and calculates reputation scores";

  private octokit: Octokit;

  constructor(runtime: IAgentRuntime) {
    super(runtime);
    this.octokit = new Octokit({
      auth: process.env.GITHUB_API_TOKEN,
    });
  }

  static async start(runtime: IAgentRuntime) {
    logger.info("Starting GitHub Verification Service");
    const service = new GitHubVerificationService(runtime);
    return service;
  }

  async verifyGitHubProfile(username: string, memberId: string) {
    try {
      // Fetch GitHub profile
      const { data: profile } = await this.octokit.users.getByUsername({
        username,
      });

      // Fetch repositories for star count
      const { data: repos } = await this.octokit.repos.listForUser({
        username,
        per_page: 100,
      });

      const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);

      // Update member record
      await db
        .update(communityMembers)
        .set({
          github_verified: true,
          github_verified_at: new Date(),
          github_profile_data: {
            public_repos: profile.public_repos,
            followers: profile.followers,
            total_stars: totalStars,
            bio: profile.bio,
            location: profile.location,
            company: profile.company,
          },
        })
        .where(eq(communityMembers.id, memberId));

      logger.info(`GitHub profile verified for ${username}`);
      return true;
    } catch (error) {
      logger.error({ error }, `Failed to verify GitHub profile: ${username}`);
      throw error;
    }
  }

  async stop() {
    logger.info("Stopping GitHub Verification Service");
  }
}
```

### Action Implementation Example

```typescript
// src/plugins/communityDirectory/actions/registerAction.ts
import type { Action, ActionResult, HandlerCallback, IAgentRuntime, Memory, State } from '@elizaos/core';
import { logger } from '@elizaos/core';
import { db } from '../database/client';
import { communityMembers } from '../database/schema';
import { GitHubVerificationService } from '../services/GitHubVerificationService';

const registerAction: Action = {
  name: "REGISTER_MEMBER",
  similes: ["JOIN", "SIGN_UP", "REGISTER"],
  description: "Handles member registration flow with GitHub verification",

  validate: async (runtime: IAgentRuntime, message: Memory, state: State): Promise<boolean> => {
    // Trigger on registration keywords
    const text = message.content.text.toLowerCase();
    return text.includes('register') || text.includes('join') || text.includes('sign up');
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    options: any,
    callback: HandlerCallback
  ): Promise<ActionResult> => {
    try {
      // Multi-turn conversation state machine
      const registrationState = state.registrationFlow || 'START';

      switch (registrationState) {
        case 'START':
          await callback({
            text: "🎉 Welcome to the Frutero Community! To join, I'll need to verify your GitHub profile. What's your GitHub username?",
          });
          return {
            text: "Registration started",
            values: { registrationFlow: 'GITHUB_USERNAME' },
            success: true,
          };

        case 'GITHUB_USERNAME':
          const username = message.content.text.trim();

          // Verify GitHub profile
          const githubService = runtime.getService<GitHubVerificationService>(
            GitHubVerificationService.serviceType
          );

          try {
            await githubService.verifyGitHubProfile(username, message.userId);

            await callback({
              text: `✅ GitHub profile verified! Now, tell me a bit about yourself - what's your primary role? (e.g., student, developer, designer)`,
            });

            return {
              text: "GitHub verified",
              values: { registrationFlow: 'PRIMARY_ROLE', githubUsername: username },
              success: true,
            };
          } catch (error) {
            await callback({
              text: `❌ Couldn't verify GitHub username "${username}". Please check and try again.`,
            });

            return {
              text: "GitHub verification failed",
              values: { registrationFlow: 'GITHUB_USERNAME' },
              success: false,
              error: error instanceof Error ? error : new Error(String(error)),
            };
          }

        case 'PRIMARY_ROLE':
          const role = message.content.text.trim();

          // Create member record
          await db.insert(communityMembers).values({
            telegram_id: message.userId,
            github_username: state.githubUsername,
            primary_role: role,
            name: state.githubUsername, // Default to GitHub username
            github_verified: true,
          });

          await callback({
            text: `🎊 Registration complete! Welcome to the community, ${state.githubUsername}! You can now explore the member directory.`,
          });

          return {
            text: "Registration completed",
            values: { registrationFlow: null, memberRegistered: true },
            success: true,
          };

        default:
          return {
            text: "Unknown registration state",
            success: false,
          };
      }
    } catch (error) {
      logger.error({ error }, "Error in registration action");
      return {
        text: "Registration failed",
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  examples: [
    [
      {
        name: "User",
        content: { text: "I want to register" },
      },
      {
        name: "Agent",
        content: {
          text: "Welcome! What's your GitHub username?",
          actions: ["REGISTER_MEMBER"],
        },
      },
    ],
  ],
};

export default registerAction;
```

### Provider Implementation Example (Using ElizaOS Memory)

```typescript
// src/plugins/communityDirectory/providers/MemberContextProvider.ts
import type { Provider, ProviderResult, IAgentRuntime, Memory, State } from '@elizaos/core';
import { logger } from '@elizaos/core';
import { db } from '../database/client';
import { communityMembers } from '../database/schema';
import { eq } from 'drizzle-orm';

/**
 * MemberContextProvider enriches agent conversations with member history and context.
 *
 * Uses ElizaOS Memory for:
 * - Previous conversation history
 * - Relationship context (who invited this member)
 * - Facts learned about the member
 *
 * Uses Drizzle for:
 * - Current member profile data
 * - Reputation scores
 * - Registration status
 */
export const memberContextProvider: Provider = {
  name: "MEMBER_CONTEXT_PROVIDER",
  description: "Provides rich context about community members during conversations",

  get: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State
  ): Promise<ProviderResult> => {
    try {
      const userId = message.userId;

      // 1. Get member profile from business database (Drizzle)
      const [member] = await db
        .select()
        .from(communityMembers)
        .where(eq(communityMembers.telegram_id, userId))
        .limit(1);

      if (!member) {
        return {
          text: "New visitor (not registered)",
          values: { isRegistered: false },
          data: {},
        };
      }

      // 2. Get previous conversations from ElizaOS Memory
      const previousConversations = await runtime.searchMemories(
        `conversations with ${member.github_username}`,
        5 // last 5 interactions
      );

      // 3. Get relationships from ElizaOS Memory (who invited them)
      const relationships = await runtime.getRelationships(member.id);
      const inviter = relationships.find(rel => rel.type === "INVITED");

      // 4. Get facts learned about this member from ElizaOS Memory
      const facts = await runtime.searchFacts(
        `facts about ${member.github_username}`
      );

      // 5. Compose rich context for the agent
      const contextText = `
Member Profile:
- Name: ${member.name}
- GitHub: ${member.github_username} (verified: ${member.github_verified})
- Role: ${member.primary_role}
- Reputation: ${member.reputation_score} (${member.reputation_tier})
- Joined: ${member.created_at.toLocaleDateString()}

Previous Interactions:
${previousConversations.map(m => `- ${m.content.text}`).join('\n')}

Community Context:
${inviter ? `- Invited by: ${inviter.entityIdA}` : '- Self-registered'}
${facts.length > 0 ? `- Known interests: ${facts.map(f => f.content).join(', ')}` : ''}

Registration Status:
- Verification: ${member.verification_status}
- Last active: ${member.last_active_at ? member.last_active_at.toLocaleDateString() : 'Never'}
      `.trim();

      return {
        text: contextText,
        values: {
          isRegistered: true,
          memberId: member.id,
          githubUsername: member.github_username,
          reputationScore: member.reputation_score,
          reputationTier: member.reputation_tier,
          primaryRole: member.primary_role,
          previousInteractionCount: previousConversations.length,
          hasInviter: !!inviter,
        },
        data: {
          member: member,
          previousConversations: previousConversations,
          relationships: relationships,
          facts: facts,
        },
      };
    } catch (error) {
      logger.error({ error }, "Error in MemberContextProvider");
      return {
        text: "Unable to load member context",
        values: { error: true },
        data: {},
      };
    }
  },
};
```

**How This Provider Works:**

1. **Hybrid Data Access**:
   - Drizzle: Current member profile (structured data)
   - ElizaOS Memory: Conversation history, relationships, facts

2. **Rich Context Injection**:
   - Agent sees full member history in every conversation
   - Can reference previous interactions naturally
   - Understands relationships (inviter/invitee)
   - Remembers learned preferences

3. **Usage in Actions**:
   ```typescript
   // Provider automatically runs before actions
   // State contains memberContextProvider data
   const { isRegistered, githubUsername, reputationScore } = state.memberContextProvider;

   if (!isRegistered) {
     await callback({ text: "Welcome! Let's get you registered." });
   } else {
     await callback({
       text: `Welcome back, ${githubUsername}! Your reputation: ${reputationScore}`
     });
   }
   ```

### Plugin Assembly

```typescript
// src/plugins/communityDirectory/index.ts
import type { Plugin } from '@elizaos/core';
import { GitHubVerificationService } from './services/GitHubVerificationService';
import { ReputationService } from './services/ReputationService';
import { InvitationService } from './services/InvitationService';
import registerAction from './actions/registerAction';
import inviteAction from './actions/inviteAction';
import { directoryRoutes } from './routes/directoryRoutes';
import { invitationRoutes } from './routes/invitationRoutes';
import { memberRoutes } from './routes/memberRoutes';
import { memberContextProvider } from './providers/MemberContextProvider';

export const communityDirectoryPlugin: Plugin = {
  name: "communityDirectory",
  description: "Community member directory with GitHub verification and reputation tracking",
  priority: 0,

  async init(config: Record<string, string>) {
    // Validate required environment variables
    if (!process.env.POSTGRES_URL) {
      throw new Error("POSTGRES_URL is required for Community Directory plugin");
    }
    if (!process.env.GITHUB_API_TOKEN) {
      throw new Error("GITHUB_API_TOKEN is required for Community Directory plugin");
    }
  },

  services: [
    GitHubVerificationService,
    ReputationService,
    InvitationService,
  ],

  actions: [
    registerAction,
    inviteAction,
  ],

  providers: [
    memberContextProvider,
  ],

  routes: [
    ...directoryRoutes,
    ...invitationRoutes,
    ...memberRoutes,
  ],
};

export default communityDirectoryPlugin;
```

---

## Environment Configuration

### Required Variables

```bash
# Database
POSTGRES_URL=postgresql://user:pass@localhost:5432/frutero_community

# GitHub Integration
GITHUB_API_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# Community Configuration
REGISTRATION_FEE=10
MIN_REPUTATION_SCORE=50
INVITATION_EXPIRY_DAYS=7
```

---

## Frontend Integration

### REST API Endpoints

The web directory interface will consume these endpoints:

```
GET  /api/members?role=developer&skills=rust&page=1&limit=20
GET  /api/members/:id
GET  /api/invitations?status=pending
POST /api/invitations { code, memberId }
GET  /api/stats/analytics
```

### WebSocket Integration (Optional)

For real-time registration status updates:

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  socket.emit('message', {
    type: 1, // ROOM_JOINING
    payload: { roomId: 'community-directory', entityId: userId },
  });
});

socket.on('messageBroadcast', (data) => {
  if (data.actionType === 'MEMBER_REGISTERED') {
    // Update directory UI
    refreshMemberList();
  }
});
```

---

## Sprint Implementation Plan Alignment

This architecture aligns with the existing 3-sprint plan (EPIC_1_IMPLEMENTATION_PLAN.md v1.1):

### Sprint 1 (21 points) - Foundation
- ✅ Database schema setup with Drizzle
- ✅ GitHub Verification Service
- ✅ Registration Action (conversational flow)
- ✅ Basic member CRUD routes

### Sprint 2 (27 points) - Core Features
- ✅ Directory Routes (complex queries with filtering)
- ✅ Reputation Service (GitHub metrics calculation)
- ✅ Invitation System (routes + service)
- ✅ Member Context Provider

### Sprint 3 (28 points) - Integration & Polish
- ✅ Frontend integration (React app consuming REST API)
- ✅ Testing (component + e2e)
- ✅ Documentation
- ✅ Performance optimization

---

## Risk Assessment & Mitigation

### Risk 1: ElizaOS Route Limitations

**Likelihood**: Low
**Impact**: Medium
**Mitigation**:
- Prototype directory routes in Sprint 1 to validate capability
- If limitations found, pivot to Option B (add Express backend) in Sprint 2
- Database schema and services remain unchanged during pivot

### Risk 2: Complex Query Performance

**Likelihood**: Medium
**Impact**: Low
**Mitigation**:
- Use Drizzle ORM with proper indexes
- Add PostgreSQL query performance monitoring
- Implement caching for frequent queries (member stats, reputation leaderboard)

### Risk 3: GitHub API Rate Limits

**Likelihood**: High
**Impact**: Medium
**Mitigation**:
- Cache GitHub profile data in `github_profile_data` JSONB field
- Implement background refresh job (daily) instead of real-time verification
- Use authenticated GitHub API (5,000 requests/hour vs 60)

---

## Decision Matrix

| Criterion | Option A (Plugin-Only) | Option B (Hybrid) | Option C (Full Separation) |
|-----------|------------------------|-------------------|---------------------------|
| Development Speed | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Deployment Complexity | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| Scalability | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| API Flexibility | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Hackathon Fit | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐ |
| **Total** | **19/25** | **17/25** | **13/25** |

---

## Conclusion

**Implement Option A (ElizaOS Plugin-Only)** for the Community Directory MVP.

This architecture provides the optimal balance of:
- ✅ Rapid development within hackathon timeline
- ✅ Sufficient technical capabilities for MVP requirements
- ✅ Minimal operational complexity
- ✅ Easy pivot to Option B if limitations discovered

The confirmed HTTP route support in ElizaOS, combined with direct PostgreSQL access, eliminates the need for a separate backend service while maintaining full REST API capabilities for the web directory interface.

---

## Next Steps

1. ✅ Create database schema with Drizzle ORM
2. ✅ Implement GitHubVerificationService prototype
3. ✅ Build registration Action with multi-turn flow
4. ✅ Create directory routes with complex query support
5. ⚠️ Monitor for route limitations during Sprint 1/2
6. 🔄 Re-evaluate architecture if blockers discovered

---

## Document Change Log

**v1.1** (2024-12-04):
- ✅ Added hybrid data strategy: ElizaOS Memory for conversational data, Drizzle for business data
- ✅ Added detailed MemberContextProvider example using ElizaOS Memory APIs
- ✅ Added data access decision matrix
- ✅ Clarified when to use each storage system

**v1.0** (2024-12-04):
- Initial architecture recommendation
- ElizaOS plugin-only approach
- Three architecture options evaluated

---

**Document Version**: 1.1
**Last Updated**: 2024-12-04
**Review Date**: End of Sprint 1 (2024-12-11)
