/**
 * Build Order Integration Test
 *
 * Tests that the build process produces expected outputs.
 */

import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import fs from 'node:fs';
import path from 'node:path';
import { $ } from 'bun';

describe('Build Order Integration Test', () => {
  const rootDir = path.resolve(__dirname, '../..');
  const distDir = path.join(rootDir, 'dist');
  const tsupBuildMarker = path.join(distDir, 'index.js'); // TSup creates this

  beforeAll(async () => {
    // Clean dist directory before test
    if (fs.existsSync(distDir)) {
      await fs.promises.rm(distDir, { recursive: true, force: true });
    }
  });

  afterAll(async () => {
    // Clean up after test
    if (fs.existsSync(distDir)) {
      await fs.promises.rm(distDir, { recursive: true, force: true });
    }
  });

  it('should produce build outputs', async () => {
    // Run the full build process
    await $`cd ${rootDir} && bun run build`;

    // Check dist directory exists
    expect(fs.existsSync(distDir)).toBe(true);

    const distFiles = fs.readdirSync(distDir);

    // Should have tsup outputs (JS file)
    expect(distFiles.some((file) => file === 'index.js')).toBe(true);

    // Should have TypeScript declaration files (in dist/src/)
    const dtsPath = path.join(distDir, 'src', 'index.d.ts');
    expect(fs.existsSync(dtsPath)).toBe(true);

    // Verify index.js is not empty
    const indexJsPath = path.join(distDir, 'index.js');
    const indexJsContent = fs.readFileSync(indexJsPath, 'utf-8');
    expect(indexJsContent.length).toBeGreaterThan(0);

    // Verify plugin is exported
    expect(indexJsContent).toContain('perkOsPlugin');
  }, 30000); // 30 second timeout for build process
});
