// B"H
/**
 * @file index_builder.mjs
 * @chapter Every Hebrew Word Becomes A Gate
 * @description Builds a separate packed AwtsmoosDB VirtualFs index. The source
 * scroll and Hebrew posts are never rewritten; only the luminous search map is
 * born in compact shards fit for this database vessel.
 */

import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { readTanach, iterateVerses } from "./tanach_reader.mjs";
import { uniqueTokens } from "./normalize_hebrew.mjs";
import { TANACH_JSON_PATH } from "./config.mjs";
import {
  openIndexDb,
  writeJson,
  tokenShardPath,
  versesPath,
  metaPath,
  shardForToken,
  closeIndexDb
} from "./db_io.mjs";

const SHARD_COUNT = 32;

function isCli() { return process.argv[1] === fileURLToPath(import.meta.url); }

function refOf(record) {
  return {
    book: record.book,
    chapter: record.chapter,
    verse: record.verse,
    articleIndex: record.articleIndex,
    verseIndex: record.verseIndex,
    heichelId: record.heichelId,
    seriesId: record.seriesId,
    postId: record.postId,
    verseSection: record.verseSection,
    hebrewPreview: record.hebrewPreview
  };
}

function verseOf(record, tokens) {
  return {
    ...refOf(record),
    bookTitle: record.bookTitle,
    rawHebrew: record.rawHebrew,
    normalizedHebrew: record.normalizedHebrew,
    tokens
  };
}

function emptyShards() {
  return Array.from({ length: SHARD_COUNT }, () => Object.create(null));
}

function addToken(shards, token, ref) {
  const shard = shardForToken(token);
  const bag = shards[shard];
  if (!bag[token]) bag[token] = [];
  bag[token].push(ref);
}

function buildPackedRecords() {
  const tanach = readTanach();
  const sourceStat = fs.statSync(TANACH_JSON_PATH);
  const shards = emptyShards();
  const verses = [];
  const allTokens = new Set();

  for (const record of iterateVerses(tanach)) {
    const tokens = uniqueTokens(record.normalizedHebrew);
    const ref = refOf(record);
    verses.push(verseOf(record, tokens));
    for (const token of tokens) {
      allTokens.add(token);
      addToken(shards, token, ref);
    }
  }

  return { chapters: tanach.length, sourceStat, shards, verses, tokens: allTokens.size };
}

export function buildIndex({ dbPath = "" } = {}) {
  const { db, dbPath: resolvedDbPath } = openIndexDb(dbPath);
  const startedAt = new Date().toISOString();
  try {
    const packed = buildPackedRecords();
    writeJson(db, versesPath(), packed.verses);
    db.fs.flush();

    const shardSizes = [];
    for (let shard = 0; shard < SHARD_COUNT; shard++) {
      const tokens = packed.shards[shard];
      shardSizes.push(Object.keys(tokens).length);
      writeJson(db, tokenShardPath(shard), { shard, tokens });
    }

    const meta = {
      kind: "tanach-hebrew-index",
      version: 2,
      layout: "packed-token-shards-v1",
      dbPath: resolvedDbPath,
      sourcePath: TANACH_JSON_PATH,
      sourceBytes: packed.sourceStat.size,
      chapters: packed.chapters,
      verses: packed.verses.length,
      tokens: packed.tokens,
      tokenShards: SHARD_COUNT,
      shardSizes,
      startedAt,
      completedAt: new Date().toISOString()
    };

    writeJson(db, metaPath(), meta);
    db.fs.flush();
    return meta;
  } finally {
    closeIndexDb(db);
  }
}

if (isCli()) console.log(JSON.stringify(buildIndex(), null, 2));
