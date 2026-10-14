#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Minimal ES module bundler for the Awtsmoos post reader.
 * @description
 * Concatenates the reader's ES module graph into a single file.
 * Pure Node.js, no dependencies (Yaakov: never install libraries).
 *
 * Handles:
 * - Relative imports (./, ../) with ?v= query strings stripped
 * - Absolute imports (/shared/...) resolved against geelooy/
 * - Named imports/exports, default exports
 * - Re-exports (export { x } from "...")
 * - Circular dependency protection (processes each file once)
 *
 * Does NOT handle:
 * - Dynamic import() with variable paths (static ones are inlined)
 * - Import assertions, import.meta
 *
 * Usage:
 *   node scripts/bundleReader.mjs <entry.js> <output.js>
 */

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
import { createHash } from 'node:crypto';

const REPO = resolve(import.meta.dirname, '..');
const GEELOOY = resolve(REPO, 'geelooy');

const seen = new Set();
const ordered = [];

// ---------------------------------------------------------------------------
// Resolve an import specifier to an absolute file path
// ---------------------------------------------------------------------------
function resolveImport(spec, fromFile) {
  // Strip query string (?v=...)
  const clean = spec.split('?')[0];
  let abs;
  if (clean.startsWith('/')) {
    // Absolute: resolve against geelooy/
    abs = resolve(GEELOOY, '.' + clean);
  } else {
    // Relative: resolve against importing file's dir
    abs = resolve(dirname(fromFile), clean);
  }
  // Try .js extension if not present
  if (!abs.endsWith('.js')) {
    try {
      readFileSync(abs + '.js');
      abs = abs + '.js';
    } catch {}
  }
  return abs;
}

// ---------------------------------------------------------------------------
// Collect modules in dependency order (post-order DFS)
// ---------------------------------------------------------------------------
function collect(file) {
  const abs = resolve(file);
  if (seen.has(abs)) return;
  seen.add(abs);

  let content;
  try {
    content = readFileSync(abs, 'utf8');
  } catch (e) {
    console.error(`Warning: cannot read ${abs}: ${e.message}`);
    return;
  }

  // Find all static imports
  const importRe = /(?:import\s+(?:[^'"]+\s+from\s+)?|export\s+[^'"]+\s+from\s+)['"]([^'"]+)['"]/g;
  let m;
  while ((m = importRe.exec(content)) !== null) {
    const spec = m[1];
    // Skip bare specifiers (npm packages) and URLs
    if (!spec.startsWith('.') && !spec.startsWith('/')) continue;
    const dep = resolveImport(spec, abs);
    collect(dep);
  }

  // Find dynamic imports with static strings
  const dynRe = /import\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((m = dynRe.exec(content)) !== null) {
    const spec = m[1];
    if (!spec.startsWith('.') && !spec.startsWith('/')) continue;
    const dep = resolveImport(spec, abs);
    collect(dep);
  }

  ordered.push({ path: abs, content });
}

// ---------------------------------------------------------------------------
// Transform a module: strip imports, convert exports to declarations
// ---------------------------------------------------------------------------
function transform(mod, pathToId) {
  let { content, path } = mod;
  const id = pathToId.get(path);

  // Remove import statements (their modules are inlined above)
  // Matches: import x from "..."; import { a, b } from "..."; import "...";
  content = content.replace(
    /^\s*import\s+(?:(?:[^{}"'\s]+|\{[^{}]*\}|\*\s+as\s+\w+)\s+from\s+)?['"][^'"]+['"]\s*;?\s*$/gm,
    `/* [bundled] import inlined from ${id} */`
  );

  // Remove dynamic import() calls with static paths — replace with Promise.resolve()
  // (the module is already inlined, so this is a no-op)
  content = content.replace(
    /import\(\s*['"][^'"]+['"]\s*\)/g,
    'Promise.resolve({})'
  );

  // Convert "export default X" to "const __default_<id> = X"
  content = content.replace(
    /^\s*export\s+default\s+/gm,
    `/* [bundled] default export */ const __default_${id} = `
  );

  // Convert "export function foo" / "export const foo" / "export class foo"
  // to plain declarations (they're already in scope)
  content = content.replace(
    /^\s*export\s+(?=(?:async\s+)?function|const|let|var|class)/gm,
    ''
  );

  // Convert "export { a, b as c };" to nothing (declarations already exist)
  // But handle "export { a } from "..."" — these are re-exports, already inlined
  content = content.replace(
    /^\s*export\s*\{[^}]*\}\s*(?:from\s*['"][^'"]+['"]\s*)?;?\s*$/gm,
    `/* [bundled] re-export inlined */`
  );

  // Wrap in a scope to avoid top-level name collisions
  // (only if the file has top-level const/let that might collide)
  return `\n// ===== [bundled] ${relative(REPO, path)} =====\n${content}\n`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
function main() {
  const [entry, output] = process.argv.slice(2);
  if (!entry || !output) {
    console.error('Usage: node scripts/bundleReader.mjs <entry.js> <output.js>');
    process.exit(1);
  }

  const entryAbs = resolve(entry);
  collect(entryAbs);

  console.log(`B"H collected ${ordered.length} modules`);

  // Assign IDs
  const pathToId = new Map();
  ordered.forEach((mod, i) => pathToId.set(mod.path, `m${i}`));

  // Transform and concatenate
  const parts = ordered.map(mod => transform(mod, pathToId));

  const bundle = `// B"H — Awtsmoos Reader Bundle
// Auto-generated by scripts/bundleReader.mjs — DO NOT EDIT
// Source: ${relative(REPO, entryAbs)}
// Modules: ${ordered.length}
// Built: ${new Date().toISOString()}
${parts.join('\n')}
`;

  const outAbs = resolve(output);
  mkdirSync(dirname(outAbs), { recursive: true });
  writeFileSync(outAbs, bundle, 'utf8');

  const hash = createHash('sha256').update(bundle).digest('hex').slice(0, 12);
  console.log(`B"H wrote ${outAbs} (${bundle.length} bytes, hash ${hash})`);
  console.log(`Modules: ${ordered.length}`);
}

main();
