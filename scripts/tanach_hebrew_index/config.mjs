// B"H
/**
 * @file config.mjs
 * @chapter The Separate Vessel Receives The Verse-Light
 * @description
 * The Tanach itself remains untouched. This module names the source scroll and
 * the independent AwtsmoosDB search ark where every Hebrew word becomes a gate.
 */

import path from "node:path";

const ROOT = process.cwd();
const TORAH_ROOT = path.resolve(ROOT, "..");

export const TANACH_JSON_PATH = path.join(TORAH_ROOT, "torah", "Tanach.json");
export const INDEX_DB_PATH = path.join(ROOT, "searchPacked", "tanach.hebrew.search.fs.awtsdb");
export const INDEX_ROOT = "/search/tanach/hebrew";
export const DEFAULT_HEICHEL_ID = "ikar";
export const DEFAULT_BATCH_SIZE = 250;
export const SEARCH_LIMIT = 25;

export function resolveIndexDbPath(customPath = "") {
  return customPath ? path.resolve(ROOT, customPath) : INDEX_DB_PATH;
}
