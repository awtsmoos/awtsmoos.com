// B"H
/**
 * @file super_packed_index_builder.mjs
 * @chapter The Index Becomes A Map, Not A Copy Of The Kingdom
 * @description
 * Builds a new super-packed Hebrew index beside the old one. It stores the
 * source location of each Hebrew segment and token postings as integer streams.
 * The actual post contents remain in the Ikar source tree. Search results can
 * later fetch the source post by series/post/path instead of carrying previews
 * inside every token reference.
 */

import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./config.mjs";
import { inferCategory, iterateIkarSeriesSegments, listSeriesIds, openLegacyDb } from "./ikar_reader.mjs";
import { encodeDeltaSorted, encodeRows } from "./packed_varint.mjs";

const DEFAULT_OUT = path.join(ROOT, "searchPacked", "ikar.hebrew.superpacked.awtsidx");
const CATEGORIES = ["other", "mishnah", "talmud_bavli", "chassidus", "rambam"];

function cliValue(name, fallback = "") {
  const arg = process.argv.find(item => item.startsWith(`--${name}=`));
  return arg ? arg.split("=").slice(1).join("=") : fallback;
}

function numberArg(name, fallback = 0) {
  const value = Number(cliValue(name, fallback));
  return Number.isFinite(value) ? value : fallback;
}

function ensureCleanDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function writeJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(value, null, 2));
}

function dictIndex(map, list, value) {
  const key = String(value || "");
  if (map.has(key)) return map.get(key);
  const index = list.length;
  list.push(key);
  map.set(key, index);
  return index;
}

function verseNumberFromPath(segment) {
  const candidates = [segment.verseSection, segment.segmentPath, segment.postTitle].filter(Boolean).join(" ");
  const match = String(candidates).match(/(?:verse|pasuk|section|\.)(\d{1,5})\b/i) || String(candidates).match(/\b(\d{1,5})\b/);
  return match ? Number(match[1]) : 0;
}

function addPosting(postings, tokenIndex, segmentId) {
  let list = postings.get(tokenIndex);
  if (!list) {
    list = [];
    postings.set(tokenIndex, list);
  }
  list.push(segmentId);
}

function bytesOfFiles(dir) {
  let total = 0;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) total += bytesOfFiles(file);
    else total += fs.statSync(file).size;
  }
  return total;
}

export async function buildSuperPackedIndex({ outDir = DEFAULT_OUT, maxSeries = 0, maxSegments = 0 } = {}) {
  ensureCleanDir(outDir);
  const startedAt = new Date().toISOString();
  const series = [];
  const posts = [];
  const paths = [];
  const tokens = [];
  const seriesMap = new Map();
  const postMap = new Map();
  const pathMap = new Map();
  const tokenMap = new Map();
  const segmentRows = [];
  const postings = new Map();
  const stats = { seriesSeen: 0, segments: 0, tokenRefs: 0, skippedTanach: 0, errors: [] };
  const db = await openLegacyDb();
  try {
    const allSeries = listSeriesIds().filter(id => inferCategory(id) !== "tanach");
    for (const seriesId of allSeries) {
      if (maxSeries && stats.seriesSeen >= maxSeries) break;
      stats.seriesSeen++;
      const category = inferCategory(seriesId);
      const seriesIndex = dictIndex(seriesMap, series, seriesId);
      for await (const segment of iterateIkarSeriesSegments(db, seriesId, { includeTanach: false, startSegmentId: stats.segments })) {
        if (segment.error) {
          stats.errors.push(segment);
          continue;
        }
        const segmentId = stats.segments++;
        const postIndex = dictIndex(postMap, posts, `${seriesId}\u0000${segment.postId}`);
        const pathIndex = dictIndex(pathMap, paths, segment.segmentPath || "");
        const categoryIndex = Math.max(0, CATEGORIES.indexOf(category));
        const verse = verseNumberFromPath(segment);
        segmentRows.push([segmentId, seriesIndex, postIndex, pathIndex, categoryIndex, verse]);
        for (const token of segment.tokens || []) {
          const tokenIndex = dictIndex(tokenMap, tokens, token);
          addPosting(postings, tokenIndex, segmentId);
          stats.tokenRefs++;
        }
        if (maxSegments && stats.segments >= maxSegments) break;
      }
      if (maxSegments && stats.segments >= maxSegments) break;
    }
  } finally {
    db.closeAwtsmoosDbFsRouter?.();
  }

  fs.writeFileSync(path.join(outDir, "segments.rows.bin"), encodeRows(segmentRows));
  const sortedTokenIndexes = [...postings.keys()].sort((a, b) => a - b);
  const chunks = [];
  const postingIndex = {};
  let offset = 0;
  for (const tokenIndex of sortedTokenIndexes) {
    const uniqueSorted = [...new Set(postings.get(tokenIndex))].sort((a, b) => a - b);
    const chunk = encodeDeltaSorted(uniqueSorted);
    postingIndex[tokenIndex] = { offset, length: chunk.length, count: uniqueSorted.length };
    chunks.push(chunk);
    offset += chunk.length;
  }
  fs.writeFileSync(path.join(outDir, "postings.bin"), Buffer.concat(chunks));
  writeJson(path.join(outDir, "series.dict.json"), series);
  writeJson(path.join(outDir, "posts.dict.json"), posts);
  writeJson(path.join(outDir, "paths.dict.json"), paths);
  writeJson(path.join(outDir, "tokens.dict.json"), tokens);
  writeJson(path.join(outDir, "postings.index.json"), postingIndex);
  const meta = {
    kind: "ikar-hebrew-super-packed-index",
    version: 1,
    layout: "dicts-plus-varint-segment-rows-and-delta-postings",
    rowWidth: 6,
    categories: CATEGORIES,
    startedAt,
    completedAt: new Date().toISOString(),
    stats,
    dictionaries: { series: series.length, posts: posts.length, paths: paths.length, tokens: tokens.length },
    bytes: bytesOfFiles(outDir)
  };
  writeJson(path.join(outDir, "meta.json"), meta);
  return meta;
}

if (process.argv[1] && process.argv[1].endsWith("super_packed_index_builder.mjs")) {
  const outDir = path.resolve(ROOT, cliValue("out", DEFAULT_OUT));
  const maxSeries = numberArg("max-series", 0);
  const maxSegments = numberArg("max-segments", 0);
  console.log(JSON.stringify(await buildSuperPackedIndex({ outDir, maxSeries, maxSegments }), null, 2));
}
