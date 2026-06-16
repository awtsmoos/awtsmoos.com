// B"H
/**
 * @file random_index_consistency_test.mjs
 * @chapter The Index Is Summoned Before The Original Scroll
 * @description Compares packed AwtsmoosDB token refs against a fresh Tanach.json
 * scan, proving exact occurrence counts and canonical Tanach order for sampled
 * Hebrew words.
 */

import { readTanach, iterateVerses } from "./tanach_reader.mjs";
import { uniqueTokens } from "./normalize_hebrew.mjs";
import { searchTanachHebrew } from "./search_tanach_hebrew.mjs";

const FIXED_WORDS = ["בראשית", "מלך", "ויאמר", "ישראל", "משה", "דוד", "ירושלם", "שמע", "בית", "שלום"];

function key(ref) {
  return [ref.book, ref.chapter, ref.verse].join(":");
}

function compareRefs(a, b) {
  return a.articleIndex - b.articleIndex || a.verseIndex - b.verseIndex;
}

function scanSource() {
  const map = new Map();
  for (const verse of iterateVerses(readTanach())) {
    for (const token of uniqueTokens(verse.normalizedHebrew)) {
      if (!map.has(token)) map.set(token, []);
      map.get(token).push({
        book: verse.book,
        chapter: verse.chapter,
        verse: verse.verse,
        articleIndex: verse.articleIndex,
        verseIndex: verse.verseIndex
      });
    }
  }
  return map;
}

function pickRandomTokens(sourceMap, count = 8) {
  const candidates = [...sourceMap.entries()]
    .filter(([, refs]) => refs.length >= 3 && refs.length <= 120)
    .map(([token]) => token);
  const out = [];
  while (out.length < count && candidates.length) {
    const index = Math.floor(Math.random() * candidates.length);
    out.push(candidates.splice(index, 1)[0]);
  }
  return out;
}

function assertToken(token, expectedRefs) {
  const result = searchTanachHebrew(token, { limit: 100000 });
  const indexedRefs = result.exact;
  const expected = [...expectedRefs].sort(compareRefs).map(key);
  const actual = indexedRefs.map(key);
  const missing = expected.filter(ref => !actual.includes(ref));
  const extra = actual.filter(ref => !expected.includes(ref));
  const orderOk = expected.length === actual.length && expected.every((ref, i) => ref === actual[i]);
  return {
    token,
    expectedCount: expected.length,
    indexedCount: actual.length,
    orderOk,
    missingCount: missing.length,
    extraCount: extra.length,
    first: actual[0] || null,
    last: actual[actual.length - 1] || null,
    sample: actual.slice(0, 5)
  };
}

const sourceMap = scanSource();
const tokens = [...new Set([...FIXED_WORDS, ...pickRandomTokens(sourceMap)])]
  .filter(token => sourceMap.has(token));
const checks = tokens.map(token => assertToken(token, sourceMap.get(token)));
const failures = checks.filter(row => row.missingCount || row.extraCount || !row.orderOk);

console.log(JSON.stringify({
  ok: failures.length === 0,
  checkedTokens: checks.length,
  failures,
  checks
}, null, 2));

if (failures.length) process.exit(1);
