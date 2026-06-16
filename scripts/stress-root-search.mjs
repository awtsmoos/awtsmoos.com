// B"H
/**
 * @file stress-root-search.mjs
 * @brief Stress tests flexible root search payloads and pagination behavior.
 *
 * Chapter 464: The searched-for spark was buried late in the root. The first
 * scan now reaches far enough to find it, accepts the strange names agents use
 * for query/path, and marks true partial pages with unmistakable continuation
 * guidance.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { bulkSearch, normalizeSearchPayload } = require('../geelooy/apps/tunnel/agent/tools/fs/pagedSearch.js');

const ROOT = process.cwd();
const STRESS_DIR = path.join(ROOT, '.awtsmoos', 'tmp', 'root-search-stress');
const REL = '.awtsmoos/tmp/root-search-stress';
const NEEDLE = 'AWTSMOOS_ROOT_SEARCH_NEEDLE_LATE_FILE_BH';

async function prepareFixture() {
  await fs.rm(STRESS_DIR, { recursive: true, force: true });
  await fs.mkdir(STRESS_DIR, { recursive: true });
  for (let i = 0; i < 80; i += 1) {
    const name = String(i).padStart(3, '0') + '.txt';
    const body = i === 72 ? `B"H late spark ${NEEDLE}\n` : `B"H filler ${i}\n`;
    await fs.writeFile(path.join(STRESS_DIR, name), body, 'utf8');
  }
}

function config() {
  return { root: ROOT, allowSecrets: true, tools: { fsRead: true, fsList: true } };
}

async function assertFinds(label, payload) {
  const result = await bulkSearch(config(), payload);
  assert.equal(result.ok, true, label);
  assert.equal(result.returnedResults, 1, `${label}: expected one result`);
  assert.ok(result.results[0].path.endsWith('072.txt'), `${label}: expected late file`);
  assert.equal(result.mustContinueToProveAbsence, false, `${label}: complete fixture should not require continuation`);
}

async function testDefaultRootScanFindsLateFile() {
  await assertFinds('default root scan', { p: REL, query: NEEDLE, action: 'rg' });
}

async function testAliasesFindLateFile() {
  await assertFinds('q/root aliases', { root: REL, q: NEEDLE, action: 'bulkSearch' });
  await assertFinds('cwd/find aliases', { cwd: REL, find: NEEDLE, action: 'search' });
  await assertFinds('directory/pattern aliases', { directory: REL, pattern: NEEDLE, action: 'grep' });
}

async function testRegexFindsLateFile() {
  await assertFinds('regex search', { p: REL, query: 'ROOT_SEARCH_NEEDLE_.*_BH', regex: true, action: 'rg' });
}

async function testStrictPageStillContinuesHonestly() {
  const result = await bulkSearch(config(), { p: REL, query: NEEDLE, maxFiles: 5, strictPage: true, action: 'rg' });
  assert.equal(result.ok, true);
  assert.equal(result.returnedResults, 0);
  assert.equal(result.hasNextScan, true);
  assert.equal(result.mustContinueToProveAbsence, true);
  assert.ok(result.nextScanRequest);
  assert.match(result.continuationGuidance, /do not conclude absence/i);
}

function testPayloadNormalization() {
  const normalized = normalizeSearchPayload({ root: REL, q: NEEDLE, limit: 7, cursor: 3, maxFiles: 5 });
  assert.equal(normalized.rootPath, REL);
  assert.equal(normalized.query, NEEDLE);
  assert.equal(normalized.pageSize, 7);
  assert.equal(normalized.fileCursor, 3);
  assert.ok(normalized.maxFiles >= 300);
}

await prepareFixture();
await testDefaultRootScanFindsLateFile();
await testAliasesFindLateFile();
await testRegexFindsLateFile();
await testStrictPageStillContinuesHonestly();
testPayloadNormalization();
console.log(JSON.stringify({ ok: true, checks: ['default-late-file', 'aliases', 'regex', 'strict-continuation', 'normalization'] }, null, 2));

