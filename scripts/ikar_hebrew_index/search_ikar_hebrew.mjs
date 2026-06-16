// B"H
/**
 * @file search_ikar_hebrew.mjs
 * @chapter The Query Walks The Mixed Heichel Gates
 */

import { fileURLToPath } from "node:url";
import { SEARCH_LIMIT, TOKEN_SHARDS } from "./config.mjs";
import { normalizeHebrew, tokenizeHebrew } from "./normalize_hebrew.mjs";
import { openIndexDb, readJson, tokenShardPath, segmentShardPath, metaPath, closeIndexDb } from "./db_io.mjs";

function isCli() { return process.argv[1] === fileURLToPath(import.meta.url); }
function limited(list, limit) { return list.slice(0, limit); }

function exactTokenSearch(db, token) {
  const shard = readJson(db, tokenShardPath(token), null);
  return shard?.tokens?.[token] || [];
}

function phraseSearch(db, normalized, limit) {
  const out = [];
  for (let shard = 0; shard < TOKEN_SHARDS; shard++) {
    const bag = readJson(db, segmentShardPath(shard), { segments: [] });
    for (const segment of bag.segments || []) {
      if (segment.normalizedHebrew?.includes(normalized)) out.push(segment);
      if (out.length >= limit) return out;
    }
  }
  return out;
}

export function searchIkarHebrew(query, { limit = SEARCH_LIMIT, dbPath = "" } = {}) {
  const normalized = normalizeHebrew(query);
  const tokens = tokenizeHebrew(query);
  const { db } = openIndexDb(dbPath);
  try {
    const meta = readJson(db, metaPath(), null);
    const exact = tokens.length === 1 ? exactTokenSearch(db, tokens[0]) : [];
    const phrase = tokens.length > 1 || exact.length === 0 ? phraseSearch(db, normalized, limit) : [];
    return { query, normalized, exact: limited(exact, limit), phrase: limited(phrase, limit), meta };
  } finally {
    closeIndexDb(db);
  }
}

function printResults(result) {
  const rows = result.exact.length ? result.exact : result.phrase;
  console.log(`B"H query=${result.query} normalized=${result.normalized} hits=${rows.length}`);
  for (const ref of rows) console.log(`${ref.category}/${ref.seriesId}/${ref.postTitle || ref.postId} @ ${ref.segmentPath} | ${ref.hebrewPreview}`);
}

if (isCli()) {
  const query = process.argv.slice(2).join(" ").trim();
  if (!query) throw new Error("Usage: node scripts/ikar_hebrew_index/search_ikar_hebrew.mjs \"מלך\"");
  printResults(searchIkarHebrew(query));
}
