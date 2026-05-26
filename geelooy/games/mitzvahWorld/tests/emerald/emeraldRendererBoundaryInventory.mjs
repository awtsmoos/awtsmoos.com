#!/usr/bin/env node
/**
 * B"H
 * Chapter 4: The green membrane counts every iron chain.
 *
 * This tunnel-safe audit does not pretend the renderer boundary is pure yet.
 * It makes remaining Three.js couplings measurable, summarized, and budgeted,
 * so every future patch can reduce bondage without drowning the console.
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd());
const TOP_LIMIT = Number(process.env.EMERALD_RENDERER_BOUNDARY_TOP || 25);
const COUPLING_PATTERNS = [/import \* as THREE/, /three\.module/, /GLTFLoader/, /DRACOLoader/, /\bTHREE\./];
const IGNORE_DIRS = new Set(['.git', 'node_modules', '.awtsmoos']);
const ALLOWED_FILES = new Set([
  'ckidsAwtsmoos/Olam/graphics/RendererCapabilities.js',
  'ckidsAwtsmoos/Olam/graphics/ThreeBridge.js',
  'tests/emerald/emeraldRendererCapabilitiesAudit.mjs',
  'tests/emerald/emeraldRendererBoundaryInventory.mjs'
]);

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (IGNORE_DIRS.has(name)) continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (/\.(mjs|js)$/.test(name)) out.push(full);
  }
  return out;
}

function relative(file) {
  return path.relative(ROOT, file).split(path.sep).join('/');
}

function countHits(file) {
  const rel = relative(file);
  if (ALLOWED_FILES.has(rel)) return null;
  const text = fs.readFileSync(file, 'utf8');
  const hits = text.split(/\r?\n/).filter(line => COUPLING_PATTERNS.some(pattern => pattern.test(line))).length;
  return hits > 0 ? { file: rel, count: hits } : null;
}

const files = walk(ROOT).map(countHits).filter(Boolean).sort((a, b) => b.count - a.count || a.file.localeCompare(b.file));
const totalHits = files.reduce((sum, item) => sum + item.count, 0);
console.log(JSON.stringify({ ok: true, totalHits, totalFiles: files.length, topLimit: TOP_LIMIT, topFiles: files.slice(0, TOP_LIMIT) }, null, 2));
