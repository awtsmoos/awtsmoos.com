// B"H
/**
 * @file exactHebrewIndex.js
 * @chapter Exact Letters In The Vessel
 * @description
 * The Awtsmoos breathes through letters without blur: no vector mist, no AI
 * guessing, only the word as it stands after careful Hebrew mark-stripping.
 */
const zlib = require('zlib');
const AwtsmoosDB = require('../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');

const DEFAULT_DB = '/Users/awtsmoos/Documents/awtsmoos-jobs/tanach-hebrew-word-index/exact-hebrew-indexes.awtsmoosdb';
const ROOTS = {
  tanach: 'tanachExactHebrewIndex',
  mishnah: 'mishnahExactHebrewIndex',
  talmudBavli: 'talmudBavliExactHebrewIndex'
};
const STRIP = new Set(['\u05BE', '\u05C0', '\u05C3', '\u05F3', '\u05F4', "'", '’', '״', '׳']);
let cache = null;

function dbPath() {
  return process.env.EXACT_HEBREW_INDEX_DB || DEFAULT_DB;
}

function normalizeWord(word) {
  return String(word || '').normalize('NFKD').split('').filter(ch => !/\p{Mark}/u.test(ch) && !STRIP.has(ch)).join('');
}

function hashText(text) {
  let h = 2166136261;
  for (const ch of String(text || '')) {
    h ^= ch.codePointAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function bucket(text, count = 256) {
  return 'b' + String(hashText(text) % count).padStart(3, '0');
}

function openDb() {
  const db = new AwtsmoosDB(dbPath(), { readOnly: true });
  db.open();
  return db;
}

function loadShard(rootKey) {
  if (!cache) cache = {};
  if (cache[rootKey]) return cache[rootKey];
  const db = openDb();
  try {
    const meta = db.DosDB.get('meta', { rootKey });
    const blob = db.DosDB.get('indexBlob', { rootKey });
    if (!blob) return null;
    const buffer = Buffer.isBuffer(blob) ? blob : Buffer.from(blob.data || blob || []);
    cache[rootKey] = { meta, index: JSON.parse(zlib.gunzipSync(buffer).toString('utf8')) };
    return cache[rootKey];
  } finally {
    db.close();
  }
}

function corpusList(raw) {
  const c = String(raw || 'tanach').trim();
  return c === 'all' ? Object.keys(ROOTS) : c.split(',').map(x => x.trim()).filter(Boolean);
}

function refShape(corpus, ref) {
  if (!ref) return null;
  return {
    corpus,
    heichelId: ref.heichelId || 'ikar',
    seriesId: ref.seriesId || ref.bookId || ref.tractateId,
    postId: ref.postId,
    bookId: ref.bookId,
    tractateId: ref.tractateId,
    bookTitleHebrew: ref.bookTitleHebrew,
    tractateTitle: ref.tractateTitle,
    chapter: ref.chapter,
    verse: ref.verse,
    mishnah: ref.mishnah,
    daf: ref.daf,
    amud: ref.amud,
    postTitle: ref.postTitle,
    type: ref.type,
    sectionIndex: ref.sectionIndex || ref.verse || ref.mishnah || null,
    subSectionIndex: null,
    text: ref.text || ref.textOrig,
    textOrig: ref.textOrig || ref.text,
    lines: ref.lines || null
  };
}

function hitShape(corpus, normalized, occurrence, ref) {
  const originalWord = occurrence[occurrence.length - 1];
  const shaped = refShape(corpus, ref);
  if (shaped && (corpus === 'mishnah' || corpus === 'talmudBavli')) {
    shaped.subSectionIndex = occurrence[1] || null;
    shaped.wordIndex = occurrence[2] || null;
  } else if (shaped) {
    shaped.wordIndex = occurrence[1] || null;
  }
  return { corpus, originalWord, normalizedWord: normalized, occurrence, ref: shaped };
}

function searchOne(corpus, normalized, offset, limit) {
  const rootKey = ROOTS[corpus];
  if (!rootKey) return { corpus, totalHits: 0, hits: [], missing: true };
  const shard = loadShard(rootKey);
  if (!shard) return { corpus, totalHits: 0, hits: [], unavailable: true };
  const word = shard.index.words[bucket(normalized)]?.[normalized];
  const occurrences = word?.o || [];
  const hits = occurrences.slice(offset, offset + limit).map(o => hitShape(corpus, normalized, o, shard.index.refs[bucket(o[0])]?.[o[0]]));
  return { corpus, totalHits: occurrences.length, hits };
}

function searchExactHebrewWord({ word, corpus, limit = 25, offset = 0 }) {
  const normalized = normalizeWord(word);
  const corpora = corpusList(corpus);
  const each = corpora.map(c => searchOne(c, normalized, Number(offset) || 0, Math.min(Number(limit) || 25, 200)));
  return {
    ok: true,
    searchType: 'exactWord',
    availableSearchTypes: ['exactWord', 'aiSemanticLater'],
    query: { original: word, normalized },
    corpus: corpus || 'tanach',
    totalHits: each.reduce((s, r) => s + r.totalHits, 0),
    resultsByCorpus: each,
    hits: each.flatMap(r => r.hits)
  };
}

module.exports = { searchExactHebrewWord, normalizeWord, ROOTS, dbPath };
