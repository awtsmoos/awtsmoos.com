// B"H
/**
 * @file db_io.mjs
 * @chapter AwtsmoosDB Opens A Separate Ark For Search
 * @description Uses the existing DosDB bridge to open one independent AwtsmoosDB
 * file, then stores compact JSON shards through its VirtualFs surface.
 */

import { createRequire } from "node:module";
import { dirname } from "node:path";
import { mkdirSync } from "node:fs";
import { INDEX_ROOT, resolveIndexDbPath } from "./config.mjs";

const require = createRequire(import.meta.url);
const DosDB = require("../../ayzarim/DosDB/index.js");
const SHARDS = 32;

export function openIndexDb(customPath = "") {
  const dbPath = resolveIndexDbPath(customPath);
  mkdirSync(dirname(dbPath), { recursive: true });
  const db = DosDB.awtsmoosDb(dbPath, { compression: false, reuseFreedSpace: "verified" });
  db.fs.ready();
  return { db, dbPath };
}

export function jsonBuffer(value) {
  return Buffer.from(JSON.stringify(value), "utf8");
}

export function writeJson(db, vpath, value) {
  db.fs.write(vpath, jsonBuffer(value));
  return vpath;
}

export function readJson(db, vpath, fallback = null) {
  const stat = db.fs.stat(vpath);
  if (!stat?.exists) return fallback;
  return JSON.parse(db.fs.cat(vpath).toString("utf8"));
}

export function shardForToken(token) {
  let hash = 0;
  for (const ch of String(token)) hash = ((hash << 5) - hash + ch.codePointAt(0)) | 0;
  return Math.abs(hash) % SHARDS;
}

export function tokenShardPath(tokenOrShard) {
  const shard = typeof tokenOrShard === "number" ? tokenOrShard : shardForToken(tokenOrShard);
  return `${INDEX_ROOT}/token_shards/${String(shard).padStart(2, "0")}.json`;
}

export function versesPath() { return `${INDEX_ROOT}/verses/all.json`; }
export function metaPath() { return `${INDEX_ROOT}/meta.json`; }
export function closeIndexDb(db) { try { db.fs.flush(); } finally { db.close?.(); } }
