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
 *
 * Chapter 467: The search was thrown into stranger weather: Unicode sparks,
 * case-sensitive shadows, result pages, ignored generated forests, single-file
 * roots, missing-query confusion, and binary neighbors. Each one must either
 * find truth or admit exactly why truth remains unfinished.
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
const UNICODE_NEEDLE = 'אור_אין_סוף_SEARCH_שלום_BH';
const CASE_NEEDLE = 'AwTsMoOs_CaSe_SpArK_BH';
const PAGED_NEEDLE = 'AWTSMOOS_PAGED_RESULT_BH';
const IGNORED_NEEDLE = 'AWTSMOOS_IGNORED_NODE_MODULES_BH';
const STRICT_NEEDLE = 'AWTSMOOS_STRICT_LATE_ONLY_BH';

async function prepareFixture() {
  await fs.rm(STRESS_DIR, { recursive: true, force: true });
  await fs.mkdir(path.join(STRESS_DIR, 'nested', 'deep'), { recursive: true });
  await fs.mkdir(path.join(STRESS_DIR, 'node_modules', 'ignored-package'), { recursive: true });
  for (let i = 0; i < 80; i += 1) {
    const name = String(i).padStart(3, '0') + '.txt';
    const body = i === 72 ? `B"H late spark ${NEEDLE}\n` : (i === 79 ? `B"H strict late ${STRICT_NEEDLE}\n` : `B"H filler ${i}\n`);
    await fs.writeFile(path.join(STRESS_DIR, name), body, 'utf8');
  }
  for (let i = 0; i < 7; i += 1) {
    await fs.writeFile(path.join(STRESS_DIR, `paged-${i}.txt`), `B"H page ${i} ${PAGED_NEEDLE}\n`, 'utf8');
  }
  await fs.writeFile(path.join(STRESS_DIR, 'unicode.txt'), `B"H unicode ${UNICODE_NEEDLE}\n`, 'utf8');
  await fs.writeFile(path.join(STRESS_DIR, 'case.txt'), `B"H case ${CASE_NEEDLE}\n`, 'utf8');
  await fs.writeFile(path.join(STRESS_DIR, 'nested', 'deep', 'spark.js'), `export const hidden = '${NEEDLE}_NESTED';\n`, 'utf8');
  await fs.writeFile(path.join(STRESS_DIR, 'node_modules', 'ignored-package', 'index.js'), `module.exports='${IGNORED_NEEDLE}';\n`, 'utf8');
  await fs.writeFile(path.join(STRESS_DIR, 'binary.png'), Buffer.from([0, 1, 2, 3, 4, 5, 6, 7]));
  const huge = ['A'.repeat(22000), `\nB"H sampled middle ${HUGE_NEEDLE}\n`, 'Z'.repeat(22000)].join('');
  await fs.writeFile(path.join(STRESS_DIR, 'huge.txt'), huge, 'utf8');
}

function config() {
  return { root: ROOT, allowSecrets: true, tools: { fsRead: true, fsList: true } };
}

async function assertFinds(label, payload, pathSuffix = '072.txt') {
  const result = await bulkSearch(config(), payload);
  assert.equal(result.ok, true, label);
  assert.ok(result.returnedResults >= 1, `${label}: expected at least one result`);
  assert.ok(result.results.some(entry => entry.path.endsWith(pathSuffix)), `${label}: expected ${pathSuffix}`);
  assert.equal(result.absenceNotProven, false, `${label}: complete fixture should prove absence beyond results`);
  assert.equal(result.confidence, 'complete');
  return result;
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
  const result = await bulkSearch(config(), { p: REL, query: STRICT_NEEDLE, maxFiles: 5, strictPage: true, action: 'rg' });
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
  const result = await bulkSearch(config(), { p: REL, query: NEEDLE, maxFiles: 5, autoContinue: true, autoScanFiles: 200, action: 'rg' });
  assert.equal(result.ok, true);
  assert.ok(result.returnedResults >= 1);
  assert.ok(result.results.some(entry => entry.path.endsWith('072.txt')));
  assert.equal(result.absenceNotProven, false);
  assert.equal(result.recommendedNextAction, 'inspect_results');
}

async function testHugeFileSampling() {
  const result = await bulkSearch(config(), { p: REL, query: HUGE_NEEDLE, maxFileBytes: 1024, sampleBytes: 24000, action: 'rg' });
  assert.equal(result.ok, true);
  assert.equal(result.returnedResults, 1);
  assert.equal(result.results[0].sampled, true);
  assert.ok(result.sampledLargeFiles >= 1);
  assert.equal(result.sampledLargeFileMatches, 1);
}

async function testUnicodeSearch() {
  await assertFinds('unicode search', { p: REL, query: UNICODE_NEEDLE, action: 'rg' }, 'unicode.txt');
}

async function testCaseSensitivity() {
  const insensitive = await bulkSearch(config(), { p: REL, query: CASE_NEEDLE.toLowerCase(), action: 'rg' });
  assert.equal(insensitive.returnedResults, 1);
  const sensitiveMiss = await bulkSearch(config(), { p: REL, query: CASE_NEEDLE.toLowerCase(), caseSensitive: true, action: 'rg' });
  assert.equal(sensitiveMiss.returnedResults, 0);
  assert.equal(sensitiveMiss.absenceNotProven, false);
  assert.equal(sensitiveMiss.recommendedNextAction, 'absence_proven_for_scanned_root');
}

async function testResultPagination() {
  const first = await bulkSearch(config(), { p: REL, query: PAGED_NEEDLE, pageSize: 3, action: 'rg' });
  assert.equal(first.returnedResults, 3);
  assert.equal(first.hasNextPage, true);
  assert.equal(first.recommendedNextAction, 'next_result_page');
  assert.ok(first.nextResultRequest);
  const second = await bulkSearch(config(), first.nextResultRequest);
  assert.equal(second.returnedResults, 3);
}

async function testSingleFileRoot() {
  await assertFinds('single file root', { p: `${REL}/unicode.txt`, query: UNICODE_NEEDLE, action: 'rg' }, 'unicode.txt');
}

async function testIgnoredDirectoriesAndBinaryNeighbors() {
  const ignored = await bulkSearch(config(), { p: REL, query: IGNORED_NEEDLE, action: 'rg' });
  assert.equal(ignored.returnedResults, 0);
  assert.equal(ignored.absenceNotProven, false);
  const binary = await bulkSearch(config(), { p: REL, query: String.fromCharCode(1), action: 'rg' });
  assert.equal(binary.skippedFiles >= 1, true);
}

async function testMissingQueryGuidance() {
  const result = await bulkSearch(config(), { p: REL, action: 'rg' });
  assert.equal(result.ok, false);
  assert.equal(result.error, 'missing_query');
  assert.equal(result.recommendedNextAction, 'provide_query');
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
await testUnicodeSearch();
await testCaseSensitivity();
await testResultPagination();
await testSingleFileRoot();
await testIgnoredDirectoriesAndBinaryNeighbors();
await testMissingQueryGuidance();
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
    'unicode',
    'case-sensitivity',
    'result-pagination',
    'single-file-root',
    'ignored-dirs-and-binary-neighbor',
    'missing-query-guidance',
    'normalization'
  ]
}, null, 2));
