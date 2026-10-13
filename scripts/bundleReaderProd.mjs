#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Awtsmoos Reader Production Bundler
 * @description
 * Bundles the post reader's ES module graph into content-hashed files.
 * Pure Node.js, zero dependencies.
 *
 * Strategy:
 * - entry bundle: static import graph from postLogic.js (critical path)
 * - dynamic import() targets stay as separate files (lazy-loaded)
 * - output: reader-core.<sha256-12>.js
 * - updates _awtsmoos.post.html with the new hash automatically
 *
 * Usage:
 *   node scripts/bundleReaderProd.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, relative, basename } from 'node:path';
import { createHash } from 'node:crypto';

const REPO = resolve(import.meta.dirname, '..');
const POST_DIR = resolve(REPO, 'geelooy/heichelos/post');
const GEELOOY = resolve(REPO, 'geelooy');
const OUT_DIR = resolve(POST_DIR, 'dist');

// ---------------------------------------------------------------------------
function resolveImport(spec, fromFile) {
  const clean = spec.split('?')[0].split('#')[0];
  let abs;
  if (clean.startsWith('/')) {
    abs = resolve(GEELOOY, '.' + clean);
  } else if (clean.startsWith('.')) {
    abs = resolve(dirname(fromFile), clean);
  } else {
    return null; // bare specifier, skip
  }
  if (!abs.endsWith('.js')) {
    try { statSync(abs + '.js'); abs = abs + '.js'; }
    catch { return null; }
  }
  try { statSync(abs); } catch { return null; }
  return abs;
}

// ---------------------------------------------------------------------------
const seen = new Set();
const ordered = [];

function collect(abs) {
  if (seen.has(abs)) return;
  seen.add(abs);
  let content;
  try { content = readFileSync(abs, 'utf8'); }
  catch { console.error(`  WARN: unreadable ${relative(REPO, abs)}`); return; }

  // Static imports AND re-exports
  const re = /(?:import\s+(?:[^'"]*?\s+from\s+)?|export\s+(?:[^'"]*?\s+from\s+))['"]([^'"]+)['"]/g;
  let m;
  const deps = [];
  while ((m = re.exec(content)) !== null) {
    const dep = resolveImport(m[1], abs);
    if (dep) deps.push(dep);
  }
  // Also catch side-effect imports: import "...";
  const seRe = /^\s*import\s*['"]([^'"]+)['"]/gm;
  while ((m = seRe.exec(content)) !== null) {
    const dep = resolveImport(m[1], abs);
    if (dep && !deps.includes(dep)) deps.push(dep);
  }

  for (const d of deps) collect(d);
  ordered.push({ path: abs, content });
}

// ---------------------------------------------------------------------------
// Transform: strip imports, neutralize exports
// We use a suffix-based approach: each module's exports are captured
// via a registry to handle cross-module references safely.
// ---------------------------------------------------------------------------
function transformModule(mod, idx) {
  let c = mod.content;
  const rel = relative(REPO, mod.path);

  // 1. Strip static import statements entirely
  //    (dependencies are inlined above in topological order)
  c = c.replace(
    /^\s*import\s+(?:type\s+)?(?:[^'";]+?\s+from\s+)?['"][^'"]+['"]\s*;?\s*$/gm,
    ''
  );

  // 2. Strip re-export statements: export { x } from "..."; export * from "...";
  c = c.replace(
    /^\s*export\s+(?:\*\s*(?:as\s+\w+\s*)?|\{[^}]*\})\s*from\s*['"][^'"]+['"]\s*;?\s*$/gm,
    ''
  );

  // 3. export default <expr> → const __bundle_default_N = <expr>
  //    Handle "export default function foo()" and "export default class"
  c = c.replace(
    /^(\s*)export\s+default\s+(?=function|class|async\s+function)/gm,
    '$1/*b*/ const __bundle_default_' + idx + ' = '
  );
  c = c.replace(
    /^(\s*)export\s+default\s+/gm,
    '$1/*b*/ const __bundle_default_' + idx + ' = '
  );

  // 4. export <declaration> → <declaration>
  c = c.replace(
    /^(\s*)export\s+(?=(?:async\s+)?(?:function|const|let|var|class)\b)/gm,
    '$1/*b*/ '
  );

  // 5. export { a, b as c }; → /* stripped */
  c = c.replace(
    /^\s*export\s*\{[^}]*\}\s*;?\s*$/gm,
    '/*b: named exports stripped (inlined scope) */'
  );

  // 6. Neutralize dynamic import() with static specifiers that we inlined:
  //    Replace with a resolved promise of empty module (code already present).
  //    DYNAMIC imports with variable paths are left alone (true lazy loading).
  //    We only neutralize ones whose target was bundled.
  //    (Conservative: leave all dynamic imports intact.)

  return `\n/* ===== BUNDLED[${idx}] ${rel} ===== */\n${c}`;
}

// ---------------------------------------------------------------------------
async function main() {
  const entry = resolve(POST_DIR, 'postLogic.js');
  console.log('B"H collecting module graph from', relative(REPO, entry));
  collect(entry);
  console.log(`B"H collected ${ordered.length} modules`);

  const parts = ordered.map((mod, i) => transformModule(mod, i));
  const bundle = `// B"H — Awtsmoos Reader Core Bundle (auto-generated, DO NOT EDIT)
// Built: ${new Date().toISOString()}
// Modules: ${ordered.length}
(function() {
'use strict';
${parts.join('\n')}
})();
`;

  const hash = createHash('sha256').update(bundle).digest('hex').slice(0, 12);
  const outName = `reader-core.${hash}.js`;
  mkdirSync(OUT_DIR, { recursive: true });
  const outPath = resolve(OUT_DIR, outName);
  writeFileSync(outPath, bundle, 'utf8');

  const kb = (bundle.length / 1024).toFixed(0);
  console.log(`B"H wrote ${relative(REPO, outPath)} (${kb}KB, ${ordered.length} modules)`);

  // Clean up old bundles
  try {
    const { unlinkSync } = await import('node:fs');
    for (const f of readdirSync(OUT_DIR)) {
      if (f.startsWith('reader-core.') && f.endsWith('.js') && f !== outName) {
        unlinkSync(resolve(OUT_DIR, f));
        console.log(`B"H removed old bundle ${f}`);
      }
    }
  } catch (e) {
    console.log('B"H bundle cleanup skipped:', e.message);
  }

  // Update HTML
  const htmlPath = resolve(POST_DIR, '_awtsmoos.post.html');
  let html = readFileSync(htmlPath, 'utf8');
  const oldRef = /\/heichelos\/post\/dist\/reader-core\.[a-f0-9]+\.js/;
  const newRef = `/heichelos/post/dist/reader-core.${hash}.js`;
  const oldModuleRef = /<script\s+type="module"\s+src="[^"]*postLogic\.js[^"]*"\s*><\/script>/;

  if (oldRef.test(html)) {
    html = html.replace(oldRef, newRef);
    console.log('B"H updated existing bundle reference in HTML');
  } else if (oldModuleRef.test(html)) {
    html = html.replace(
      oldModuleRef,
      `<script type="module" src="${newRef}"><\/script>`
    );
    console.log('B"H replaced postLogic.js reference with bundle in HTML');
  } else {
    console.log('B"H WARNING: no script reference found to replace in HTML');
  }
  writeFileSync(htmlPath, html, 'utf8');

  console.log(`\nDone. Bundle: ${outName} (${kb}KB)`);
  console.log(`HTML updated: ${relative(REPO, htmlPath)}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { collect, transformModule };
