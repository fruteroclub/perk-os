# Epic 1: Community Directory

**Epic ID**: EPIC-001
**Status**: 🔄 In Progress
**Timeline**: 6 weeks (3 sprints)
**Total Story Points**: 76
**Team Size**: 2-3 developers
**Architecture**: ElizaOS Plugin + Hybrid Data Strategy (ElizaOS Memory + Drizzle ORM)

---

## =� Epic Overview

Build a conversational member directory system with GitHub verification, reputation scoring, and invitation management. Features include Telegram-based registration flow, web directory with search/filtering, and participation tracking.

### Strategic Goals
-  Onboard new members through conversational registration
-  Build searchable member directory for community discovery
-  Track member engagement and participation
-  Enable community managers to invite and manage members

### Key Architectural Decisions
- **Hybrid Data Strategy**: ElizaOS Memory for conversations/relationships, Drizzle ORM for business data
- **Single Deployment**: ElizaOS plugin-only architecture (no separate backend)
- **GitHub Verification**: Primary identity verification (wallet verification moved to post-MVP)
- **Reputation System**: GitHub-based scoring with configurable formula

---

## <� Sprint Breakdown

### Sprint 1: Foundation (Weeks 1-2)
**Goal**: Database setup and invitation system
**Story Points**: 21
**Status**: 🔄 In Progress

| Ticket | Title | Points | Status | Assignee |
|--------|-------|--------|--------|----------|
| CD-101 | Database Migrations | 5 | ✅ | Claude Code |
| CD-102 | Plugin Structure | 3 | =2 | Unassigned |
| CD-103 | InvitationService | 5 | =2 | Unassigned |
| CD-104 | Telegram /invite Command | 3 | =2 | Unassigned |
| CD-105 | Web UI Invitations | 3 | =2 | Unassigned |
| CD-106 | Expiration Cron | 2 | =2 | Unassigned |

### Sprint 2: Registration & Verification (Weeks 3-4)
**Goal**: Member registration flow with GitHub verification
**Story Points**: 27
**Status**: =2 Not Started

| Ticket | Title | Points | Status | Assignee |
|--------|-------|--------|--------|----------|
| CD-201 | Registration State Machine | 8 | =2 | Unassigned |
| CD-202 | GitHubVerificationService | 5 | =2 | Unassigned |
| CD-203 | ReputationService | 3 | =2 | Unassigned |
| CD-204 | Member Profile Creation | 5 | =2 | Unassigned |
| CD-205 | GitHub API Utilities | 3 | =2 | Unassigned |
| CD-206 | Profile Edit Action | 3 | =2 | Unassigned |
| CD-207 | Welcome Message Flow | 1 | =2 | Unassigned |
| CD-208 | Unit Tests | 2 | =2 | Unassigned |

### Sprint 3: Directory & Admin Tools (Weeks 5-6)
**Goal**: Member directory, participation tracking, bulk messaging
**Story Points**: 28
**Status**: =2 Not Started

| Ticket | Title | Points | Status | Assignee |
|--------|-------|--------|--------|----------|
| CD-301 | DirectoryService | 5 | =2 | Unassigned |
| CD-302 | Directory Web UI | 5 | =2 | Unassigned |
| CD-303 | Pagination | 2 | =2 | Unassigned |
| CD-304 | ParticipationTrackingService | 5 | =2 | Unassigned |
| CD-305 | Serena MCP Integration | 3 | =2 | Unassigned |
| CD-306 | Participation Listener | 3 | =2 | Unassigned |
| CD-307 | Manager Query Interface | 2 | =2 | Unassigned |
| CD-308 | Member Profile Pages | 2 | =2 | Unassigned |
| CD-309 | E2E Tests | 1 | =2 | Unassigned |

---

## =� Ticket Status Board

### =2 Not Started (20 tickets)
CD-102, CD-103, CD-104, CD-105, CD-106, CD-201, CD-202, CD-203, CD-204, CD-205, CD-206, CD-207, CD-208, CD-301, CD-302, CD-303, CD-304, CD-305, CD-306, CD-307, CD-308, CD-309

### = In Progress (0 tickets)
_None_

### ✅ Completed (1 ticket)
CD-101

### � Blocked (0 tickets)
_None_

---

## = Dependencies Visualization

### Critical Path (Must Complete in Order)
```
CD-101 (Database)
  �
CD-102 (Plugin Structure)
  �
CD-103 (InvitationService)
  �
CD-201 (Registration Flow)
  �
CD-202 (GitHub Verification)
  �
CD-204 (Profile Creation)
  �
CD-301 (DirectoryService)
  �
CD-302 (Directory UI)
```

### Parallel Tracks

**Track 1: Invitation System**
- CD-103 � CD-104 (Telegram Command)
- CD-103 � CD-105 (Web UI)
- CD-103 � CD-106 (Cron Job)

**Track 2: GitHub Integration**
- CD-202 � CD-205 (API Utilities)
- CD-202 � CD-203 (Reputation Service)

**Track 3: Member Features**
- CD-204 � CD-206 (Profile Edit)
- CD-204 � CD-207 (Welcome Message)

**Track 4: Directory**
- CD-301 � CD-302 (Web UI)
- CD-301 � CD-303 (Pagination)
- CD-301 � CD-307 (Manager Interface)
- CD-301 � CD-308 (Profile Pages)

**Track 5: Participation**
- CD-304 � CD-305 (Serena MCP)
- CD-304 � CD-306 (Listener)

---

## =� Velocity Tracking

### Sprint Metrics

| Sprint | Planned Points | Completed Points | Velocity | Status |
|--------|----------------|------------------|----------|--------|
| Sprint 1 | 21 | 5 | 24% | 🔄 In Progress |
| Sprint 2 | 27 | 0 | 0% | =2 Not Started |
| Sprint 3 | 28 | 0 | 0% | =2 Not Started |
| **Total** | **76** | **5** | **7%** | **🔄 In Progress** |

### Daily Burndown (Sprint 1)
_Track story points completed per day once sprint starts_

```
Day 1:  [ 21 points remaining ] - CD-101 completed (5 points)
Day 2:  [ 16 points remaining ]
Day 3:  [ __ points remaining ]
Day 4:  [ __ points remaining ]
Day 5:  [ __ points remaining ]
Day 6:  [ __ points remaining ]
Day 7:  [ __ points remaining ]
Day 8:  [ __ points remaining ]
Day 9:  [ __ points remaining ]
Day 10: [ __ points remaining ]
```

---

## <� Definition of Done

### Per Ticket
- [ ] Code written following project style guide
- [ ] TypeScript compilation successful
- [ ] Unit tests written with >80% coverage
- [ ] Code reviewed by at least one team member
- [ ] Documentation updated
- [ ] Tested in dev environment
- [ ] Acceptance criteria met

### Per Sprint
- [ ] All sprint tickets completed
- [ ] Sprint demo prepared
- [ ] Sprint retrospective conducted
- [ ] Next sprint planned

### Per Epic
- [ ] All 3 sprints complete (76 points)
- [ ] 100+ members can use system
- [ ] All E2E tests passing
- [ ] Documentation complete
- [ ] Production deployment successful

---

## =� Risk Register

### Active Risks

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| GitHub API rate limits | High | Medium | Cache profile data, use authenticated API (5K/hr) | Dev Team |
| ElizaOS route limitations | Low | Medium | Prototype early in Sprint 1, pivot to Express if needed | Tech Lead |
| Scope creep | Medium | High | Strict MoSCoW adherence, defer to post-MVP | PM |
| Testing underestimation | Medium | Medium | 1 point per ticket for testing, explicit test tickets | QA Lead |
| Complex query performance | Medium | Low | Use Drizzle with proper indexes, monitor performance | Backend Dev |

---

## =� Key Resources

### Documentation
- [Epic 1 Implementation Plan](../../docs/specs/EPIC_1_IMPLEMENTATION_PLAN.md)
- [Architecture Recommendation](../../docs/specs/ARCHITECTURE_RECOMMENDATION.md)
- [ElizaOS Plugin Guide](https://elizaos.github.io/eliza/docs/core/plugins/)
- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)

### Design Assets
- Figma: Member Directory UI mockups
- Brand colors: Frutero palette
- Icons: Lucide React

### API References
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [GitHub REST API](https://docs.github.com/en/rest)
- [Octokit.js](https://octokit.github.io/rest.js/)

---

## <� Success Criteria

### Sprint 1 Success
- [ ] Managers can create invitations via Telegram and web UI
- [ ] Invitation codes work and expire after 3 days
- [ ] All 6 tickets (CD-101 to CD-106) completed

### Sprint 2 Success
- [ ] Users can complete registration from invitation
- [ ] GitHub verification working with real API
- [ ] Members can edit profiles after registration
- [ ] All 8 tickets (CD-201 to CD-208) completed

### Sprint 3 Success
- [ ] Directory accessible with search and filtering
- [ ] Participation tracking active in Telegram
- [ ] Managers can query member analytics
- [ ] All 9 tickets (CD-301 to CD-309) completed

### Epic Success
- [ ] All 21 tickets completed (76 story points)
- [ ] 100+ members can register and use directory
- [ ] All E2E tests passing (>80% coverage)
- [ ] Documentation complete
- [ ] Production deployment successful
- [ ] Hackathon demo ready

---

## = Sprint Ceremonies

### Sprint Planning
- **When**: First day of sprint
- **Duration**: 2 hours
- **Agenda**: Review tickets, assign work, clarify acceptance criteria

### Daily Standup
- **When**: Every day, 9:00 AM
- **Duration**: 15 minutes
- **Format**:
  - What did I complete yesterday?
  - What am I working on today?
  - Any blockers?

### Sprint Review
- **When**: Last day of sprint
- **Duration**: 1 hour
- **Agenda**: Demo completed work, gather feedback

### Sprint Retrospective
- **When**: Last day of sprint
- **Duration**: 1 hour
- **Agenda**: What went well? What to improve? Action items?

---

## =� Quick Navigation

### Sprint 1 Tickets
- [CD-101: Database Migrations](sprint-1/CD-101.md)
- [CD-102: Plugin Structure](sprint-1/CD-102.md)
- [CD-103: InvitationService](sprint-1/CD-103.md)
- [CD-104: Telegram /invite Command](sprint-1/CD-104.md)
- [CD-105: Web UI Invitations](sprint-1/CD-105.md)
- [CD-106: Expiration Cron](sprint-1/CD-106.md)

### Sprint 2 Tickets
- [CD-201: Registration State Machine](sprint-2/CD-201.md)
- [CD-202: GitHubVerificationService](sprint-2/CD-202.md)
- [CD-203: ReputationService](sprint-2/CD-203.md)
- [CD-204: Member Profile Creation](sprint-2/CD-204.md)
- [CD-205: GitHub API Utilities](sprint-2/CD-205.md)
- [CD-206: Profile Edit Action](sprint-2/CD-206.md)
- [CD-207: Welcome Message Flow](sprint-2/CD-207.md)
- [CD-208: Unit Tests](sprint-2/CD-208.md)

### Sprint 3 Tickets
- [CD-301: DirectoryService](sprint-3/CD-301.md)
- [CD-302: Directory Web UI](sprint-3/CD-302.md)
- [CD-303: Pagination](sprint-3/CD-303.md)
- [CD-304: ParticipationTrackingService](sprint-3/CD-304.md)
- [CD-305: Serena MCP Integration](sprint-3/CD-305.md)
- [CD-306: Participation Listener](sprint-3/CD-306.md)
- [CD-307: Manager Query Interface](sprint-3/CD-307.md)
- [CD-308: Member Profile Pages](sprint-3/CD-308.md)
- [CD-309: E2E Tests](sprint-3/CD-309.md)

---

**Last Updated**: 2025-12-05
**Next Review**: End of Sprint 1
