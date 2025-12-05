# Epic 1: Community Directory - Development Tickets

**Status**: Ready for Development
**Total Story Points**: 76
**Duration**: 3 Sprints (6 weeks)
**Team Size**: 2-3 developers

---

## Sprint Overview

| Sprint | Duration | Story Points | Status |
|--------|----------|--------------|--------|
| Sprint 1: Foundation | Weeks 1-2 | 21 | ⬜ Not Started |
| Sprint 2: Registration & Verification | Weeks 3-4 | 27 | ⬜ Not Started |
| Sprint 3: Directory & Admin Tools | Weeks 5-6 | 28 | ⬜ Not Started |

---

## Sprint 1: Foundation (21 points)

**Goal**: Database setup and invitation system

| Ticket | Title | Points | Priority | Status |
|--------|-------|--------|----------|--------|
| [CD-101](sprint-1/CD-101.md) | Database Migrations | 5 | P0 | ⬜ |
| [CD-102](sprint-1/CD-102.md) | Plugin Structure | 3 | P0 | ⬜ |
| [CD-103](sprint-1/CD-103.md) | InvitationService | 5 | P0 | ⬜ |
| [CD-104](sprint-1/CD-104.md) | Telegram /invite Command | 3 | P1 | ⬜ |
| [CD-105](sprint-1/CD-105.md) | Web UI for Invitations | 3 | P2 | ⬜ |
| [CD-106](sprint-1/CD-106.md) | Invitation Expiration Cron | 2 | P2 | ⬜ |

**Key Deliverable**: Managers can create and manage invitations

---

## Sprint 2: Registration & Verification (27 points)

**Goal**: Member registration flow with GitHub verification

| Ticket | Title | Points | Priority | Status |
|--------|-------|--------|----------|--------|
| [CD-201](sprint-2/CD-201.md) | Registration State Machine | 8 | P0 | ⬜ |
| [CD-202](sprint-2/CD-202.md) | GitHubVerificationService | 5 | P0 | ⬜ |
| [CD-203](sprint-2/CD-203.md) | ReputationService | 3 | P1 | ⬜ |
| [CD-204](sprint-2/CD-204.md) | Member Profile Creation | 3 | P1 | ⬜ |
| [CD-205](sprint-2/CD-205.md) | GitHub API Utilities | 3 | P1 | ⬜ |
| [CD-206](sprint-2/CD-206.md) | Profile Edit Action | 3 | P1 | ⬜ |
| [CD-207](sprint-2/CD-207.md) | Welcome Message Flow | 3 | P1 | ⬜ |
| [CD-208](sprint-2/CD-208.md) | Unit Tests for Sprint 2 | 2 | P1 | ⬜ |

**Key Deliverable**: Complete registration journey from invite to active member

---

## Sprint 3: Directory & Admin Tools (28 points)

**Goal**: Member directory, participation tracking, bulk messaging

| Ticket | Title | Points | Priority | Status |
|--------|-------|--------|----------|--------|
| [CD-301](sprint-3/CD-301.md) | DirectoryService with Filtering | 5 | P0 | ⬜ |
| [CD-302](sprint-3/CD-302.md) | Directory Web UI | 5 | P1 | ⬜ |
| [CD-303](sprint-3/CD-303.md) | Pagination and Search | 3 | P1 | ⬜ |
| [CD-304](sprint-3/CD-304.md) | ParticipationTrackingService | 3 | P1 | ⬜ |
| [CD-305](sprint-3/CD-305.md) | Serena MCP Memory Integration | 3 | P1 | ⬜ |
| [CD-306](sprint-3/CD-306.md) | Participation Event Listener | 3 | P1 | ⬜ |
| [CD-307](sprint-3/CD-307.md) | Manager Query Interface | 2 | P2 | ⬜ |
| [CD-308](sprint-3/CD-308.md) | Member Profile Pages | 2 | P1 | ⬜ |
| [CD-309](sprint-3/CD-309.md) | E2E Testing Suite | 2 | P1 | ⬜ |

**Key Deliverable**: Fully functional community directory with admin tools

---

## Priority Levels

- **P0 (Blocker)**: Critical path tickets that block other work
- **P1 (High)**: Core features required for MVP
- **P2 (Medium)**: Nice-to-have enhancements

---

## Development Workflow

### Starting a Ticket

1. Review ticket acceptance criteria
2. Check dependencies are complete
3. Update status to 🔄 In Progress
4. Update assignee field
5. Create feature branch: `feature/CD-XXX-description`

### During Development

1. Follow technical approach in ticket
2. Reference related documentation
3. Write tests as you go (TDD encouraged)
4. Update ticket with implementation notes

### Completing a Ticket

1. Verify all acceptance criteria met
2. Run all tests (>80% coverage required)
3. Update Definition of Done checklist
4. Request code review
5. Update status to ✅ Complete
6. Merge to main branch

---

## Testing Requirements

Every ticket must include:
- **Unit Tests**: >80% coverage
- **Integration Tests**: Key workflows
- **Manual Testing**: Procedures documented

---

## Documentation

- [Epic 1 Implementation Plan](../../docs/specs/EPIC_1_IMPLEMENTATION_PLAN.md)
- [Architecture Recommendation](../../docs/specs/ARCHITECTURE_RECOMMENDATION.md)
- [Community Directory Spec](../../docs/COMMUNITY_DIRECTORY_SPEC.md)

---

## Questions or Issues?

Contact project leads or raise in daily standup.

**Last Updated**: 2024-12-05
