# PerkOS Community Directory Plugin

ElizaOS plugin for conversational member directory with GitHub verification, reputation scoring, and invitation management.

## Overview

This plugin provides the Community Directory feature for kukulcán, the first PerkOS Community Agent. It enables:

- **Member Registration**: Telegram-based conversational registration flow
- **GitHub Verification**: Identity verification via GitHub profile
- **Reputation Scoring**: GitHub-based reputation calculation and tier assignment
- **Invitation System**: Invite-only membership with trackable invitation codes
- **Participation Tracking**: Cross-platform engagement monitoring

## Architecture

### Hybrid Data Strategy

| Data Type | Storage | Purpose |
|-----------|---------|---------|
| Member Profiles | Drizzle/PostgreSQL | Business data, profiles, reputation |
| Invitations | Drizzle/PostgreSQL | Invitation codes, status, expiry |
| Relationships | Drizzle/PostgreSQL | Member connections (JSONB for flexibility) |
| Participation | Drizzle/PostgreSQL | Engagement events and metrics |
| Conversations | ElizaOS Memory | Chat history, facts, context |

### Directory Structure

```
plugin-perk-os/
├── src/
│   ├── index.ts                 # Plugin exports
│   ├── plugin.ts                # Main plugin definition with schema
│   ├── database/
│   │   └── schema.ts            # Drizzle table definitions (5 tables)
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces and enums
│   ├── actions/                 # ElizaOS Actions (message handlers)
│   │   └── .gitkeep
│   ├── services/                # Background services
│   │   └── .gitkeep
│   ├── providers/               # Context providers for prompts
│   │   └── .gitkeep
│   ├── routes/                  # HTTP API endpoints
│   │   └── .gitkeep
│   ├── utils/                   # Shared utilities
│   │   └── .gitkeep
│   ├── frontend/                # React UI components
│   │   ├── index.tsx
│   │   ├── index.css
│   │   └── utils.ts
│   └── __tests__/               # Test files
│       ├── plugin.test.ts
│       ├── integration.test.ts
│       └── e2e/
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Database Schema

### Tables

1. **community_invitations** - Invitation codes and tracking
   - Indexes: code, status, created_by

2. **community_members** - Member profiles with GitHub verification
   - Indexes: telegram_id, github_username, status, reputation_score

3. **member_relationships** - Member connections (JSONB content)
   - Indexes: entity_a, entity_b, type

4. **member_participation** - Engagement event tracking
   - Indexes: member_id, event_type, occurred_at

5. **member_daily_highlights** - Aggregated daily metrics
   - Indexes: member_id + highlight_date (composite)

### Auto-Migration

The plugin exports a `schema` property that ElizaOS uses for automatic migration:

```typescript
export const perkOsPlugin: Plugin = {
  name: 'plugin-perk-os',
  schema: communityDirectorySchema,  // Auto-migrated on startup
  // ...
};
```

## Type System

All types are exported from `types/index.ts`:

### Enums
- `InvitationStatus`: pending, accepted, expired, cancelled
- `MemberStatus`: not_member, pending, active, suspended, banned
- `MemberRole`: student, developer, designer, researcher, founder, etc.
- `ReputationTier`: Novice, Contributor, Active Developer, Experienced, Expert
- `ParticipationEventType`: MESSAGE, REACTION, VOICE, ACTION, JOIN, LEAVE
- `Platform`: telegram, discord, twitch, kick, github
- `RelationshipType`: INVITED, MENTORED, COLLABORATED, REFERRED

### Interfaces
- `CommunityMember` - Full member profile
- `CommunityInvitation` - Invitation record
- `MemberRelationship` - Member connections
- `MemberParticipation` - Engagement events
- `MemberDailyHighlight` - Daily aggregates
- `GitHubProfileData` - GitHub API response data
- `ProfileData` - Additional profile fields

### Helper Functions
- `getReputationTier(score)` - Convert score to tier
- `calculateReputationScore(metrics)` - Calculate from GitHub metrics

## Reputation Formula

```
Score = (public_repos × 5) + (followers × 3) + (total_stars × 2) + (contributions × 1)
```

| Tier | Score Range |
|------|-------------|
| Novice | 0 - 100 |
| Contributor | 101 - 500 |
| Active Developer | 501 - 1,000 |
| Experienced | 1,001 - 2,500 |
| Expert | 2,501+ |

## Development

### Prerequisites

- Bun runtime
- ElizaOS CLI (`elizaos`)
- PostgreSQL or PGLite (auto-configured)

### Commands

```bash
# Build the plugin
bun run build

# Run in development mode (from project root)
cd .. && elizaos dev

# Type checking
bun run type-check

# Run tests
bun test

# Format code
bun run format
```

### Plugin Registration

The plugin is registered in `src/character.ts`:

```typescript
plugins: [
  "@elizaos/plugin-sql",
  "plugin-perk-os",  // Package name from dependencies
  // ...
],
```

## Testing

### Test Structure

```
src/__tests__/
├── *.test.ts           # Component tests (Bun test runner)
├── integration.test.ts # Integration tests
└── e2e/                # E2E tests (ElizaOS test runner)
    └── *.ts
```

### Running Tests

```bash
# All tests
bun test

# Component tests only
bun run test:component

# E2E tests
bun run test:e2e
```

## Roadmap

### Sprint 1: Foundation (Current)
- [x] CD-101: Database Migrations
- [x] CD-102: Plugin Structure
- [ ] CD-103: InvitationService
- [ ] CD-104: Telegram /invite Command
- [ ] CD-105: Web UI Invitations
- [ ] CD-106: Expiration Cron

### Sprint 2: Registration & Verification
- [ ] CD-201: Registration State Machine
- [ ] CD-202: GitHubVerificationService
- [ ] CD-203: ReputationService
- [ ] CD-204: Member Profile Creation

### Sprint 3: Directory & Admin
- [ ] CD-301: DirectoryService
- [ ] CD-302: Directory Web UI
- [ ] CD-304: ParticipationTrackingService

## Related Documentation

- [Epic 1 Implementation Plan](../docs/specs/EPIC_1_IMPLEMENTATION_PLAN.md)
- [Architecture Recommendation](../docs/specs/ARCHITECTURE_RECOMMENDATION.md)
- [Community Directory Spec](../docs/COMMUNITY_DIRECTORY_SPEC.md)
- [ElizaOS Plugin Guide](https://elizaos.github.io/eliza/docs/core/plugins/)

## License

UNLICENSED - Private repository
