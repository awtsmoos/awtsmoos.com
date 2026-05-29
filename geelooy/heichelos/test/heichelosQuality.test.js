// B"H
/**
 * Chapter 1: The Gate of Measured Fire.
 *
 * The Awtsmoos speaks every vessel into being each instant; this sentinel does
 * not pretend the palace is already perfected. It measures the current Heichelos
 * world, freezes its debt into an explicit covenant, and refuses future chaos
 * that grows beyond the revealed baseline.
 *
 * Runtime contract:
 * - reads only files under geelooy/heichelos
 * - uses no external dependencies
 * - fails when new monoliths, copied fossils, unsafe sinks, or logs exceed the
 *   known inspected baseline
 * - prints a compact JSON summary for future refactor planning
 */
const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.join('geelooy', 'heichelos');
const extensions = new Set(['.js', '.mjs', '.css', '.html']);
const ignoredParts = new Set(['.git', '.awtsmoos', 'node_modules']);
const baseline = Object.freeze({
  maxLinesPerFile: 698,
  maxFilesOver200Lines: 20,
  maxCopiedSubmitTemplates: 2,
  maxRuntimeConsoleLogs: 79,
  maxRawHtmlSinkFiles: 66
});

/**
 * Walks the Heichelos palace one real path at a time.
 * @param {string} dir directory to inspect
 * @returns {string[]} sorted source files
 */
function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (ignoredParts.has(entry.name)) return [];
    const next = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(next);
    return extensions.has(path.extname(entry.name)) ? [next] : [];
  }).sort();
}

/**
 * Reads a source vessel and counts its line-breaths.
 * @param {string} file source path
 * @returns {{file:string, text:string, lines:number}}
 */
function inspect(file) {
  const text = fs.readFileSync(file, 'utf8');
  return { file, text, lines: text.split(/\r?\n/).length };
}

/**
 * Keeps test fixtures from being judged like runtime scrolls.
 * @param {string} file source path
 * @returns {boolean} true when the file is a test/helper vessel
 */
function isTestLike(file) {
  return /(?:^|[/\\])test(?:[/\\])/.test(file) || /\.test\.mjs$|\.test\.js$/.test(file);
}

/**
 * Counts runtime console sparks, excluding deliberate test announcements.
 * @param {{file:string,text:string}[]} records inspected records
 * @returns {number} count of runtime console.log occurrences
 */
function countRuntimeLogs(records) {
  return records.filter(record => !isTestLike(record.file)).reduce(
    (sum, record) => sum + (record.text.match(/console\.log\s*\(/g) || []).length,
    0
  );
}

/**
 * Finds files with direct HTML sinks that future refactors must purify.
 * @param {{file:string,text:string}[]} records inspected records
 * @returns {string[]} files containing raw HTML sink syntax
 */
function rawHtmlSinkFiles(records) {
  return records.filter(record => /\.innerHTML\s*=|insertAdjacentHTML\s*\(/.test(record.text))
    .map(record => record.file);
}

/**
 * Summarizes the measured world for humans and future agents.
 * @param {{file:string,lines:number,text:string}[]} records inspected records
 * @returns {object} governance summary
 */
function summarize(records) {
  const sortedBySize = [...records].sort((a, b) => b.lines - a.lines);
  const copiedSubmitTemplates = records.filter(record =>
    /_awtsmoos\.submitToHeichel copy(?: 2)?\.html$/.test(record.file)
  );
  const oversized = records.filter(record => record.lines > 200);
  return {
    scannedFiles: records.length,
    largestFile: sortedBySize[0] && { file: sortedBySize[0].file, lines: sortedBySize[0].lines },
    filesOver200Lines: oversized.length,
    copiedSubmitTemplates: copiedSubmitTemplates.length,
    runtimeConsoleLogs: countRuntimeLogs(records),
    rawHtmlSinkFiles: rawHtmlSinkFiles(records).length
  };
}

const records = walk(root).map(inspect);
const summary = summarize(records);

assert(records.length > 100, 'Heichelos quality gate scanned too few files');
assert(summary.largestFile.lines <= baseline.maxLinesPerFile,
  `largest Heichelos file grew past baseline: ${JSON.stringify(summary.largestFile)}`);
assert(summary.filesOver200Lines <= baseline.maxFilesOver200Lines,
  `too many Heichelos files exceed 200 lines: ${summary.filesOver200Lines}`);
assert(summary.copiedSubmitTemplates <= baseline.maxCopiedSubmitTemplates,
  `copied submit templates grew: ${summary.copiedSubmitTemplates}`);
assert(summary.runtimeConsoleLogs <= baseline.maxRuntimeConsoleLogs,
  `runtime console.log debt grew: ${summary.runtimeConsoleLogs}`);
assert(summary.rawHtmlSinkFiles <= baseline.maxRawHtmlSinkFiles,
  `raw HTML sink file count grew: ${summary.rawHtmlSinkFiles}`);

console.log('B"H heichelosQuality.test passed', JSON.stringify(summary));
