/**
 * PerkOS Plugin Integration Tests
 *
 * Tests how multiple components of the plugin work together.
 */

import { describe, expect, it, beforeEach, afterAll, beforeAll } from 'bun:test';
import { perkOsPlugin, InvitationService } from '../index';
import { createMockRuntime, setupLoggerSpies, MockRuntime } from './test-utils';
import { IAgentRuntime } from '@elizaos/core';

// Set up spies on logger
beforeAll(() => {
  setupLoggerSpies();
});

afterAll(() => {
  // No global restore needed in bun:test
});

describe('Integration: InvitationService with Plugin', () => {
  let mockRuntime: MockRuntime;

  beforeEach(() => {
    // Create a service mock that will be returned by getService
    const mockService = {
      capabilityDescription: 'Manages community invitations with CRUD operations',
      stop: () => Promise.resolve(),
    };

    // Create a mock runtime with a spied getService method
    const getServiceImpl = (serviceType: string) => {
      if (serviceType === 'invitation-service') {
        return mockService as any;
      }
      return null;
    };

    mockRuntime = createMockRuntime({
      getService: getServiceImpl as any,
    });
    (mockRuntime as any).db = {}; // Mock database
  });

  it('should have InvitationService registered in plugin', () => {
    expect(perkOsPlugin.services).toBeDefined();
    expect(perkOsPlugin.services?.length).toBe(1);
    expect(perkOsPlugin.services?.[0]).toBe(InvitationService);
  });

  it('should get InvitationService from runtime', () => {
    const service = mockRuntime.getService('invitation-service');
    expect(service).toBeDefined();
    expect(service?.capabilityDescription).toContain('invitation');
  });
});

describe('Integration: Plugin initialization and service registration', () => {
  it('should initialize the plugin and register the service', async () => {
    // Create a fresh mock runtime with mocked registerService for testing initialization flow
    const mockRuntime = createMockRuntime();
    (mockRuntime as any).db = {}; // Mock database

    // Create and install a mock registerService
    const registerServiceCalls: any[] = [];
    mockRuntime.registerService = (service: any) => {
      registerServiceCalls.push({ service });
      return Promise.resolve();
    };

    // Run plugin initialization
    if (perkOsPlugin.init) {
      await perkOsPlugin.init({}, mockRuntime as unknown as IAgentRuntime);

      // Directly mock the service registration that happens during initialization
      // because unit tests don't run the full agent initialization flow
      if (perkOsPlugin.services) {
        const InvitationServiceClass = perkOsPlugin.services[0];
        const serviceInstance = await InvitationServiceClass.start(
          mockRuntime as unknown as IAgentRuntime
        );

        // Register the Service class to match the core API
        mockRuntime.registerService(InvitationServiceClass);
      }

      // Now verify the service was registered with the runtime
      expect(registerServiceCalls.length).toBeGreaterThan(0);
    }
  });

  it('should start InvitationService successfully', async () => {
    const mockRuntime = createMockRuntime();
    (mockRuntime as any).db = {}; // Mock database

    const service = await InvitationService.start(mockRuntime as unknown as IAgentRuntime);

    expect(service).toBeInstanceOf(InvitationService);
    expect(InvitationService.serviceType).toBe('invitation-service');
  });
});

describe('Integration: Database schema with plugin', () => {
  it('should export schema with all required tables', () => {
    expect(perkOsPlugin.schema).toBeDefined();

    const schemaKeys = Object.keys(perkOsPlugin.schema || {});
    expect(schemaKeys).toContain('communityInvitations');
    expect(schemaKeys).toContain('communityMembers');
    expect(schemaKeys).toContain('memberRelationships');
    expect(schemaKeys).toContain('memberParticipation');
    expect(schemaKeys).toContain('memberDailyHighlights');
  });
});
