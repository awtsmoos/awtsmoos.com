// B"H
/**
 * Chapter 474: The searcher did not know the forest, so the forest spoke.
 * This stress creates decoy paths and a true path, then demands ranked hints
 * and executable bulkSearch requests before any root-wide wandering begins.
 */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { pathHints, tokens, score } = require('../geelooy/apps/tunnel/agent/tools/fs/pathHints.js');
const { buildReadActions } = require('../geelooy/apps/tunnel/agent/tools/fs/actionGroups/readActions.js');
const ROOT = process.cwd();
const REL = '.awtsmoos/tmp/path-hints-stress';
const DIR = path.join(ROOT, REL);
const cfg = { root: ROOT, tools: { fsRead: true } };

async function reset() {
  await fs.rm(DIR, { recursive: true, force: true });
  await fs.mkdir(path.join(DIR, 'src/search/pathResolver'), { recursive: true });
  await fs.mkdir(path.join(DIR, 'docs/random'), { recursive: true });
  await fs.writeFile(path.join(DIR, 'src/search/pathResolver/index.js'), 'const pathResolver = true;');
  await fs.writeFile(path.join(DIR, 'docs/random/notes.txt'), 'nothing here');
}

await reset();
assert.deepEqual(tokens({ query: 'Path Resolver' }), ['path', 'resolver']);
assert.ok(score('src/search/pathResolver', 'dir', ['path', 'resolver']) > score('docs/random', 'dir', ['path', 'resolver']));
const got = await pathHints(cfg, { p: REL, query: 'path resolver', maxResults: 5, maxDepth: 5 });
assert.equal(got.ok, true);
assert.equal(got.results[0].path.includes('pathResolver'), true);
assert.equal(got.results[0].searchRequest.action, 'bulkSearch');
assert.equal(got.results[0].searchRequest.autoContinue, true);
const viaAction = await buildReadActions({ config: cfg, payload: { action: 'pathHints', p: REL, query: 'path resolver' } }).pathHints();
assert.equal(viaAction.results[0].path.includes('pathResolver'), true);
const viaSearch = await buildReadActions({ config: cfg, payload: { action: 'search', mode: 'paths', p: REL, query: 'path resolver' } }).search();
assert.equal(viaSearch.action, 'pathHints');
console.log(JSON.stringify({ ok: true, topPath: got.results[0].path, checks: ['tokens', 'score', 'direct', 'action', 'search-mode'] }, null, 2));
