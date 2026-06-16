// B"H
/**
 * @file super_packed_query.mjs
 * @chapter The Packed Sparks Are Read Back Into Their Addresses
 * @description
 * Tiny smoke query tool for the super-packed index. It decodes token postings
 * and resolves segment IDs back into series/post/path references without any
 * Hebrew content copied into the posting records.
 */

import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./config.mjs";
import { decodeDeltaSorted, decodeRows } from "./packed_varint.mjs";

const DEFAULT_INDEX = path.join(ROOT, "searchPacked", "ikar.hebrew.superpacked.awtsidx");

function cliValue(name, fallback = "") {
  const arg = process.argv.find(item => item.startsWith(`--${name}=`));
  return arg ? arg.split("=").slice(1).join("=") : fallback;
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function loadIndex(indexDir) {
  const meta = readJson(path.join(indexDir, "meta.json"));
  return {
    meta,
    series: readJson(path.join(indexDir, "series.dict.json")),
    posts: readJson(path.join(indexDir, "posts.dict.json")),
    paths: readJson(path.join(indexDir, "paths.dict.json")),
    tokens: readJson(path.join(indexDir, "tokens.dict.json")),
    postingIndex: readJson(path.join(indexDir, "postings.index.json")),
    postings: fs.readFileSync(path.join(indexDir, "postings.bin")),
    segmentRows: decodeRows(fs.readFileSync(path.join(indexDir, "segments.rows.bin")), meta.rowWidth)
  };
}

function rowMap(rows) {
  const map = new Map();
  for (const row of rows) map.set(row[0], row);
  return map;
}

function decodePostings(index, tokenIndex) {
  const pointer = index.postingIndex[String(tokenIndex)] || index.postingIndex[tokenIndex];
  if (!pointer) return [];
  const bytes = index.postings.subarray(pointer.offset, pointer.offset + pointer.length);
  return decodeDeltaSorted(bytes);
}

export function queryPackedIndex({ indexDir = DEFAULT_INDEX, token = "", limit = 10 } = {}) {
  const index = loadIndex(indexDir);
  const tokenIndex = index.tokens.indexOf(token);
  if (tokenIndex < 0) return { token, found: false, matches: [] };
  const rows = rowMap(index.segmentRows);
  const segmentIds = decodePostings(index, tokenIndex);
  const matches = segmentIds.slice(0, limit).map(segmentId => {
    const row = rows.get(segmentId);
    if (!row) return { segmentId, missingRow: true };
    const [, seriesIndex, postIndex, pathIndex, categoryIndex, verseNumber] = row;
    const postKey = index.posts[postIndex] || "";
    const split = postKey.split("\u0000");
    return {
      segmentId,
      seriesId: index.series[seriesIndex],
      postId: split[1] || postKey,
      segmentPath: index.paths[pathIndex],
      category: index.meta.categories[categoryIndex] || "other",
      verseNumber
    };
  });
  return { token, found: true, totalMatches: segmentIds.length, matches };
}

if (process.argv[1] && process.argv[1].endsWith("super_packed_query.mjs")) {
  const indexDir = path.resolve(ROOT, cliValue("index", DEFAULT_INDEX));
  const token = cliValue("token", "");
  const limit = Number(cliValue("limit", 10));
  console.log(JSON.stringify(queryPackedIndex({ indexDir, token, limit }), null, 2));
}
