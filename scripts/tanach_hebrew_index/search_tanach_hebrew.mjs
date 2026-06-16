// B"H
/**
 * @file search_tanach_hebrew.mjs
 * @chapter The Word Is Spoken And All Its Verses Answer
 * @description Exact normalized token search first from packed token shards;
 * multi-token or missed terms fall back to a normalized phrase scan over the
 * indexed verse table.
 */

import { fileURLToPath } from "node:url";
import { SEARCH_LIMIT } from "./config.mjs";
import { normalizeHebrew, tokenizeHebrew } from "./normalize_hebrew.mjs";
import {
  openIndexDb,
  readJson,
  tokenShardPath,
  versesPath,
  metaPath,
  closeIndexDb
} from "./db_io.mjs";

function isCli() { return process.argv[1] === fileURLToPath(import.meta.url); }
function limited(list, limit) { return list.slice(0, limit); }

function loadVerses(db) { return readJson(db, versesPath(), []); }

function exactTokenSearch(db, token) {
  const shard = readJson(db, tokenShardPath(token), null);
  return shard?.tokens?.[token] || [];
}

function phraseSearch(db, normalized, limit) {
  if (!normalized) return [];
  const out = [];
  for (const verse of loadVerses(db)) {
    if (verse?.normalizedHebrew?.includes(normalized)) out.push(verse);
    if (out.length >= limit) break;
  }
  return out;
}

export function searchTanachHebrew(query, { limit = SEARCH_LIMIT, dbPath = "" } = {}) {
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
  for (const ref of rows) console.log(`${ref.book} ${ref.chapter}:${ref.verse} | ${ref.hebrewPreview}`);
}

if (isCli()) {
  const query = process.argv.slice(2).join(" ").trim();
  if (!query) throw new Error("Usage: node scripts/tanach_hebrew_index/search_tanach_hebrew.mjs \"בראשית\"");
  printResults(searchTanachHebrew(query));
}
