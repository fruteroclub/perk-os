/**
 * UI Route Handler
 *
 * Serves the React frontend through ElizaOS plugin routes.
 * - GET /ui - Serves index.html with injected ELIZA_CONFIG
 * - GET /assets/:filename - Serves static assets (JS, CSS, images)
 */

import type { Route, IAgentRuntime } from '@elizaos/core';
import { logger } from '@elizaos/core';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cache the built HTML to avoid reading from disk on every request
let cachedHtml: string | null = null;
let cachedAssets: Map<string, { content: Buffer; contentType: string }> = new Map();

/**
 * Get content type from file extension
 */
function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const types: Record<string, string> = {
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.json': 'application/json',
    '.ico': 'image/x-icon',
  };
  return types[ext] || 'application/octet-stream';
}

/**
 * Get the frontend directory path
 */
function getFrontendDir(): string {
  // In production, we're in dist/index.js, so frontend is at dist/frontend
  // In development, we might be in src/routes/ui.ts, so frontend is at ../../dist/frontend
  const possiblePaths = [
    path.join(__dirname, '../frontend'), // dist/frontend from dist/index.js
    path.join(__dirname, '../../dist/frontend'), // dist/frontend from src/routes/ui.ts
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return p;
    }
  }

  // Default to the first path (production case)
  return possiblePaths[0];
}

/**
 * Load frontend assets from the assets directory
 */
function loadFrontendAssets(): void {
  const frontendDir = getFrontendDir();
  const assetsDir = path.join(frontendDir, 'assets');

  if (!fs.existsSync(assetsDir)) {
    logger.warn('[ui-routes] Assets directory not found, frontend may not be built');
    return;
  }

  // Load all assets from the assets directory
  const files = fs.readdirSync(assetsDir);
  for (const file of files) {
    const filePath = path.join(assetsDir, file);
    const stat = fs.statSync(filePath);
    if (stat.isFile()) {
      const content = fs.readFileSync(filePath);
      cachedAssets.set(file, { content, contentType: getContentType(file) });
    }
  }

  logger.info(`[ui-routes] Loaded ${cachedAssets.size} frontend assets`);
}

/**
 * Get HTML with injected ELIZA_CONFIG
 */
function getHtmlWithConfig(agentId: string, apiBase: string): string {
  const frontendDir = getFrontendDir();
  const indexPath = path.join(frontendDir, 'index.html');

  if (!cachedHtml) {
    if (!fs.existsSync(indexPath)) {
      throw new Error('Frontend not built. Run: bun run build');
    }
    cachedHtml = fs.readFileSync(indexPath, 'utf-8');
    loadFrontendAssets();
  }

  // Inject ELIZA_CONFIG before closing </head> tag
  const configScript = `<script>window.ELIZA_CONFIG = { agentId: "${agentId}", apiBase: "${apiBase}" };</script>`;
  return cachedHtml.replace('</head>', `${configScript}</head>`);
}

/**
 * Clear the cache (useful for testing or hot reload)
 */
export function clearUiCache(): void {
  cachedHtml = null;
  cachedAssets.clear();
}

/**
 * GET /ui - Serve the main frontend HTML
 */
export const uiIndexRoute: Route = {
  name: 'ui-index',
  path: '/ui',
  type: 'GET',
  public: true,
  handler: async (req: any, res: any, runtime: IAgentRuntime) => {
    try {
      const agentId = runtime.agentId;
      // Build API base from request or fallback to localhost
      const protocol = req.protocol || 'http';
      const host = req.get?.('host') || req.headers?.host || 'localhost:3000';
      const apiBase = `${protocol}://${host}`;

      const html = getHtmlWithConfig(agentId, apiBase);

      res.type('html').send(html);
    } catch (error) {
      logger.error('[ui-routes] Error serving UI:', error);
      res.status(500).send('Frontend not available. Ensure the project is built.');
    }
  },
};

/**
 * GET /assets/:filename - Serve static assets (JS, CSS, images)
 *
 * Assets are served at /assets/ (not /ui/assets/) because the HTML at /ui
 * references them with relative paths like ./assets/index.js, which resolves
 * to /api/agents/{agentId}/plugins/plugin-perk-os/assets/index.js
 */
export const uiAssetsRoute: Route = {
  name: 'ui-assets',
  path: '/assets/:filename',
  type: 'GET',
  public: true,
  handler: async (req: any, res: any) => {
    try {
      const filename = req.params?.filename;

      if (!filename) {
        return res.status(400).send('Filename required');
      }

      // Ensure assets are loaded
      if (cachedAssets.size === 0) {
        loadFrontendAssets();
      }

      const asset = cachedAssets.get(filename);
      if (!asset) {
        return res.status(404).send('Asset not found');
      }

      // Set cache headers for assets (1 year - they have hashed filenames)
      res.set('Cache-Control', 'public, max-age=31536000, immutable');
      res.type(asset.contentType).send(asset.content);
    } catch (error) {
      logger.error('[ui-routes] Error serving asset:', error);
      res.status(500).send('Asset not available');
    }
  },
};

/**
 * All UI routes
 */
export const uiRoutes: Route[] = [uiIndexRoute, uiAssetsRoute];

export default uiRoutes;
