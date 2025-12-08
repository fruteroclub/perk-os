/**
 * PerkOS Plugin Tests
 *
 * Tests for plugin configuration and structure.
 */

import { describe, expect, it, spyOn, beforeEach } from 'bun:test';
import { perkOsPlugin, InvitationService } from '../index';
import { logger } from '@elizaos/core';
import { createMockRuntime } from './test-utils';

describe('PerkOS Plugin Configuration', () => {
  it('should have correct plugin metadata', () => {
    expect(perkOsPlugin.name).toBe('plugin-perk-os');
    expect(perkOsPlugin.description).toContain('Community Directory');
  });

  it('should have valid plugin name format', () => {
    expect(perkOsPlugin.name).toMatch(/^[a-z0-9-]+$/);
  });

  it('should export database schema', () => {
    expect(perkOsPlugin.schema).toBeDefined();
    expect(perkOsPlugin.schema).toHaveProperty('communityInvitations');
    expect(perkOsPlugin.schema).toHaveProperty('communityMembers');
    expect(perkOsPlugin.schema).toHaveProperty('memberRelationships');
    expect(perkOsPlugin.schema).toHaveProperty('memberParticipation');
    expect(perkOsPlugin.schema).toHaveProperty('memberDailyHighlights');
  });

  it('should have InvitationService registered', () => {
    expect(perkOsPlugin.services).toBeDefined();
    expect(perkOsPlugin.services?.length).toBeGreaterThan(0);
    expect(perkOsPlugin.services).toContain(InvitationService);
  });

  it('should have inviteAction registered', () => {
    expect(perkOsPlugin.actions).toBeDefined();
    expect(perkOsPlugin.actions?.length).toBe(1);
    expect(perkOsPlugin.actions?.[0].name).toBe('CREATE_INVITATION');
  });

  it('should have empty arrays for providers and routes', () => {
    // These will be populated in future tickets
    expect(perkOsPlugin.providers).toEqual([]);
    expect(perkOsPlugin.routes).toEqual([]);
  });
});

describe('PerkOS Plugin Initialization', () => {
  beforeEach(() => {
    spyOn(logger, 'info').mockImplementation(() => {});
    spyOn(logger, 'debug').mockImplementation(() => {});
  });

  it('should initialize without errors', async () => {
    const runtime = createMockRuntime();

    if (perkOsPlugin.init) {
      // Should complete without throwing
      await perkOsPlugin.init({}, runtime);
    }
  });

  it('should log initialization message', async () => {
    const runtime = createMockRuntime();

    if (perkOsPlugin.init) {
      await perkOsPlugin.init({}, runtime);
      expect(logger.info).toHaveBeenCalled();
    }
  });
});

describe('InvitationService Integration', () => {
  it('should have correct service type', () => {
    expect(InvitationService.serviceType).toBe('invitation-service');
  });

  it('should be able to instantiate service', async () => {
    const runtime = createMockRuntime();
    (runtime as any).db = {}; // Mock db

    const service = await InvitationService.start(runtime);
    expect(service).toBeInstanceOf(InvitationService);
  });
});
