// B"H
/**
 * @file stress-root-search.mjs
 * @brief Stress tests flexible root search payloads and pagination behavior.
 *
 * Chapter 464: The searched-for spark was buried late in the root. The first
 * scan now reaches far enough to find it, accepts the strange names agents use
 * for query/path, and marks true partial pages with unmistakable continuation
 * guidance.
 *
 * Chapter 466: The absence contract was sealed. Empty partial searches must
 * say absence is not proven; auto-continuation must find late files; huge files
 * are sampled instead of silently skipped.
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
const HUGE_NEEDLE = 'AWTSMOOS_ROOT_SEARCH_HUGE_SAMPLE_BH';

async function prepareFixture() {
  await fs.rm(STRESS_DIR, { recursive: true, force: true });
  await fs.mkdir(STRESS_DIR, { recursive: true });
  for (let i = 0; i < 80; i += 1) {
    const name = String(i).padStart(3, '0') + '.txt';
    const body = i === 72 ? `B"H late spark ${NEEDLE}\n` : `B"H filler ${i}\n`;
    await fs.writeFile(path.join(STRESS_DIR, name), body, 'utf8');
  }
  const huge = [
    'A'.repeat(22000),
    `\nB"H sampled middle ${HUGE_NEEDLE}\n`,
    'Z'.repeat(22000)
  ].join('');
  await fs.writeFile(path.join(STRESS_DIR, 'huge.txt'), huge, 'utf8');
}

function config() {
  return { root: ROOT, allowSecrets: true, tools: { fsRead: true, fsList: true } };
}

async function assertFinds(label, payload) {
  const result = await bulkSearch(config(), payload);
  assert.equal(result.ok, true, label);
  assert.equal(result.returnedResults, 1, `${label}: expected one result`);
  assert.ok(result.results[0].path.endsWith('072.txt'), `${label}: expected late file`);
  assert.equal(result.absenceNotProven, false, `${label}: complete fixture should prove absence beyond results`);
  assert.equal(result.confidence, 'complete');
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
  assert.equal(result.absenceNotProven, true);
  assert.equal(result.searchIncomplete, true);
  assert.equal(result.confidence, 'partial');
  assert.equal(result.recommendedNextAction, 'continue_scan');
  assert.ok(result.nextScanRequest);
  assert.match(result.continuationGuidance, /absence is not proven/i);
}

async function testAutoContinueFindsLateFile() {
  const result = await bulkSearch(config(), {
    p: REL,
    query: NEEDLE,
    maxFiles: 5,
    autoContinue: true,
    autoScanFiles: 200,
    action: 'rg'
  });
  assert.equal(result.ok, true);
  assert.equal(result.returnedResults, 1);
  assert.equal(result.absenceNotProven, false);
  assert.equal(result.recommendedNextAction, 'inspect_results');
}

async function testHugeFileSampling() {
  const result = await bulkSearch(config(), {
    p: REL,
    query: HUGE_NEEDLE,
    maxFileBytes: 1024,
    sampleBytes: 24000,
    action: 'rg'
  });
  assert.equal(result.ok, true);
  assert.equal(result.returnedResults, 1);
  assert.equal(result.results[0].sampled, true);
  assert.ok(result.sampledLargeFiles >= 1);
  assert.equal(result.sampledLargeFileMatches, 1);
}

function testPayloadNormalization() {
  const normalized = normalizeSearchPayload({ root: REL, q: NEEDLE, limit: 7, cursor: 3, maxFiles: 5, autoContinue: true });
  assert.equal(normalized.rootPath, REL);
  assert.equal(normalized.query, NEEDLE);
  assert.equal(normalized.pageSize, 7);
  assert.equal(normalized.fileCursor, 3);
  assert.equal(normalized.autoContinue, true);
  assert.ok(normalized.maxFiles >= 300);
}

await prepareFixture();
await testDefaultRootScanFindsLateFile();
await testAliasesFindLateFile();
await testRegexFindsLateFile();
await testStrictPageStillContinuesHonestly();
await testAutoContinueFindsLateFile();
await testHugeFileSampling();
testPayloadNormalization();
console.log(JSON.stringify({
  ok: true,
  checks: [
    'default-late-file',
    'aliases',
    'regex',
    'strict-continuation',
    'auto-continue',
    'huge-file-sampling',
    'normalization'
  ]
}, null, 2));
