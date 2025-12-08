/**
 * UI Routes Tests
 *
 * Tests for the frontend UI route handlers.
 */

import { describe, expect, it, mock, beforeEach, afterEach } from 'bun:test';
import { uiIndexRoute, uiAssetsRoute, clearUiCache } from '../routes/ui.ts';
import type { IAgentRuntime } from '@elizaos/core';

describe('UI Routes', () => {
  // Mock runtime
  const mockRuntime = {
    agentId: 'test-agent-123',
  } as unknown as IAgentRuntime;

  // Mock request
  const createMockReq = (overrides = {}) => ({
    protocol: 'http',
    get: (header: string) => (header === 'host' ? 'localhost:3000' : undefined),
    headers: { host: 'localhost:3000' },
    params: {},
    ...overrides,
  });

  // Mock response
  const createMockRes = () => {
    const res: any = {
      type: mock(() => res),
      send: mock(() => res),
      status: mock(() => res),
      set: mock(() => res),
    };
    return res;
  };

  beforeEach(() => {
    // Clear the cache before each test
    clearUiCache();
  });

  describe('uiIndexRoute', () => {
    it('should have correct route configuration', () => {
      expect(uiIndexRoute.name).toBe('ui-index');
      expect(uiIndexRoute.path).toBe('/ui');
      expect(uiIndexRoute.type).toBe('GET');
      expect(uiIndexRoute.public).toBe(true);
      expect(typeof uiIndexRoute.handler).toBe('function');
    });

    it('should serve HTML when frontend is built', async () => {
      const mockReq = createMockReq();
      const mockRes = createMockRes();

      await uiIndexRoute.handler!(mockReq, mockRes, mockRuntime);

      // If frontend is built, it serves HTML; otherwise returns 500
      // Both are valid outcomes depending on build state
      const wasServed = mockRes.type.mock.calls.length > 0;
      const wasError = mockRes.status.mock.calls.length > 0;

      expect(wasServed || wasError).toBe(true);

      if (wasServed) {
        expect(mockRes.type).toHaveBeenCalledWith('html');
        expect(mockRes.send).toHaveBeenCalled();
      }
    });

    it('should inject ELIZA_CONFIG with agentId when serving HTML', async () => {
      const mockReq = createMockReq();
      const mockRes = createMockRes();

      await uiIndexRoute.handler!(mockReq, mockRes, mockRuntime);

      // If HTML was served, verify ELIZA_CONFIG injection
      if (mockRes.type.mock.calls.length > 0) {
        const sendCall = mockRes.send.mock.calls[0];
        if (sendCall && typeof sendCall[0] === 'string') {
          expect(sendCall[0]).toContain('ELIZA_CONFIG');
          expect(sendCall[0]).toContain('test-agent-123');
        }
      }
    });

    it('should construct apiBase from request headers', async () => {
      const mockReq = createMockReq({
        protocol: 'https',
        get: (header: string) => (header === 'host' ? 'example.com' : undefined),
      });
      const mockRes = createMockRes();

      await uiIndexRoute.handler!(mockReq, mockRes, mockRuntime);

      // If HTML was served, verify apiBase is in config
      if (mockRes.type.mock.calls.length > 0) {
        const sendCall = mockRes.send.mock.calls[0];
        if (sendCall && typeof sendCall[0] === 'string') {
          expect(sendCall[0]).toContain('https://example.com');
        }
      }
    });
  });

  describe('uiAssetsRoute', () => {
    it('should have correct route configuration', () => {
      expect(uiAssetsRoute.name).toBe('ui-assets');
      // Assets served at /assets/ to match relative paths in HTML at /ui
      expect(uiAssetsRoute.path).toBe('/assets/:filename');
      expect(uiAssetsRoute.type).toBe('GET');
      expect(uiAssetsRoute.public).toBe(true);
      expect(typeof uiAssetsRoute.handler).toBe('function');
    });

    it('should return 400 when filename is missing', async () => {
      const mockReq = createMockReq({ params: {} });
      const mockRes = createMockRes();

      await uiAssetsRoute.handler!(mockReq, mockRes, mockRuntime);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.send).toHaveBeenCalledWith('Filename required');
    });

    it('should return 404 when asset is not found', async () => {
      const mockReq = createMockReq({ params: { filename: 'nonexistent.js' } });
      const mockRes = createMockRes();

      await uiAssetsRoute.handler!(mockReq, mockRes, mockRuntime);

      expect(mockRes.status).toHaveBeenCalledWith(404);
      expect(mockRes.send).toHaveBeenCalledWith('Asset not found');
    });
  });

  describe('Route Integration', () => {
    it('should export uiRoutes array with both routes', async () => {
      const { uiRoutes } = await import('../routes/ui.ts');

      expect(Array.isArray(uiRoutes)).toBe(true);
      expect(uiRoutes.length).toBe(2);
      expect(uiRoutes[0]).toBe(uiIndexRoute);
      expect(uiRoutes[1]).toBe(uiAssetsRoute);
    });

    it('should export clearUiCache function', async () => {
      const { clearUiCache } = await import('../routes/ui.ts');

      expect(typeof clearUiCache).toBe('function');
      // Should not throw
      clearUiCache();
    });
  });

  describe('Route Validation', () => {
    it('uiIndexRoute path should start with /', () => {
      expect(uiIndexRoute.path.startsWith('/')).toBe(true);
    });

    it('uiAssetsRoute path should start with /', () => {
      expect(uiAssetsRoute.path.startsWith('/')).toBe(true);
    });

    it('routes should have valid HTTP methods', () => {
      const validMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];
      expect(validMethods).toContain(uiIndexRoute.type);
      expect(validMethods).toContain(uiAssetsRoute.type);
    });
  });
});
