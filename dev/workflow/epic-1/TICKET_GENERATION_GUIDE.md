# Ticket Generation Guide

This document contains the remaining tickets to be created for Epic 1: Community Directory.

## Tickets Created ✅
- [x] index.md - Epic overview
- [x] CD-101 - Database Migrations
- [x] CD-102 - Plugin Structure

## Remaining Tickets 🔲

### Sprint 1 (4 remaining)
- [ ] CD-103 - InvitationService (5 pts)
- [ ] CD-104 - Telegram /invite Command (3 pts)
- [ ] CD-105 - Web UI Invitations (3 pts)
- [ ] CD-106 - Expiration Cron (2 pts)

### Sprint 2 (8 tickets)
- [ ] CD-201 - Registration State Machine (8 pts)
- [ ] CD-202 - GitHubVerificationService (5 pts)
- [ ] CD-203 - ReputationService (3 pts)
- [ ] CD-204 - Member Profile Creation (5 pts)
- [ ] CD-205 - GitHub API Utilities (3 pts)
- [ ] CD-206 - Profile Edit Action (3 pts)
- [ ] CD-207 - Welcome Message Flow (1 pt)
- [ ] CD-208 - Unit Tests (2 pts)

### Sprint 3 (9 tickets)
- [ ] CD-301 - DirectoryService (5 pts)
- [ ] CD-302 - Directory Web UI (5 pts)
- [ ] CD-303 - Pagination (2 pts)
- [ ] CD-304 - ParticipationTrackingService (5 pts)
- [ ] CD-305 - Serena MCP Integration (3 pts)
- [ ] CD-306 - Participation Listener (3 pts)
- [ ] CD-307 - Manager Query Interface (2 pts)
- [ ] CD-308 - Member Profile Pages (2 pts)
- [ ] CD-309 - E2E Tests (1 pt)

## Next Steps

1. Review CD-101 and CD-102 as templates
2. For each remaining ticket, follow the template structure:
   - Header with metadata
   - Description
   - Acceptance Criteria
   - Technical Approach (with Data Access Strategy)
   - Tasks checklist
   - Files to Create/Modify
   - Testing Requirements
   - Related Documentation
   - Implementation Notes
   - Definition of Done

3. Reference the source documents:
   - EPIC_1_IMPLEMENTATION_PLAN.md (lines 59-1229)
   - ARCHITECTURE_RECOMMENDATION.md (lines 158-689)

4. Maintain consistency:
   - Data Access Strategy section in each ticket
   - Proper dependencies listed
   - Cross-references to specification documents
   - Story point allocations match plan

## Template Structure

Each ticket follows this format:

```markdown
# [TICKET-ID]: [Title]

**Epic**: Community Directory
**Sprint**: [1/2/3]
**Story Points**: [X]
**Priority**: [P0/P1/P2]
**Status**: 🔲 Not Started
**Assignee**: Unassigned
**Dependencies**: [Ticket IDs]

---

## 📋 Description
[Clear description of what needs to be built]

---

## 🎯 Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2

---

## 📐 Technical Approach

### Data Access Strategy
- **ElizaOS Memory**: [What uses Memory]
- **Drizzle/PostgreSQL**: [What uses DB]

### Architecture Notes
[Key decisions from ARCHITECTURE_RECOMMENDATION.md]

---

## ✅ Tasks
- [ ] Task 1
- [ ] Task 2

---

## 📁 Files to Create/Modify
- `path/to/file.ts` - Description

---

## 🧪 Testing Requirements

### Unit Tests
- [ ] Test case 1

### Integration Tests
- [ ] Test scenario 1

---

## 🔗 Related Documentation
- [EPIC_1_IMPLEMENTATION_PLAN.md](../../../docs/specs/EPIC_1_IMPLEMENTATION_PLAN.md)
- [ARCHITECTURE_RECOMMENDATION.md](../../../docs/specs/ARCHITECTURE_RECOMMENDATION.md)

---

## 📝 Implementation Notes
[Space for developer notes]

---

## ✅ Definition of Done
- [ ] Code written following project style guide
- [ ] TypeScript compilation successful
- [ ] Unit tests written with >80% coverage
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Tested in dev environment
- [ ] Acceptance criteria met

---

**Created**: 2024-12-05
**Last Updated**: 2024-12-05
**Estimated Completion**: [Day X of Sprint Y]
```
