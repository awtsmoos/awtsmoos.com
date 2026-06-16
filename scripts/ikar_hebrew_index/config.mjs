// B"H
/**
 * @file config.mjs
 * @chapter The Ikar Heichel Receives A Separate Search Vessel
 * @description Names the live folder DB source and the independent AwtsmoosDB
 * index file. No heichel posts are modified by these scripts.
 */

import path from "node:path";

export const ROOT = process.cwd();
export const SOURCE_DB_ROOT = path.resolve(ROOT, "../../dayuhChadash");
export const HEICHEL_ID = "ikar";
export const IKAR_SERIES_ROOT = path.join(SOURCE_DB_ROOT, "social", "heichelos", HEICHEL_ID, "series");
export const INDEX_DB_PATH = path.join(ROOT, "searchPacked", "ikar.hebrew.search.fs.awtsdb");
export const INDEX_ROOT = "/search/ikar/hebrew";
export const TOKEN_SHARDS = 64;
export const SEARCH_LIMIT = 25;

export function resolveIndexDbPath(customPath = "") {
  return customPath ? path.resolve(ROOT, customPath) : INDEX_DB_PATH;
}
