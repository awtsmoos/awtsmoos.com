// B"H
/**
 * @file compact_existing_shards_coordinator.mjs
 * @chapter Sixty Four Shards Become One Small Vessel
 * @description
 * Converts an existing JSONL Ikar index work directory into a super-packed
 * binary index without deleting or changing the source shards. It can spawn one
 * worker per shard, then merges partials into dense segment IDs, AwtsmoosBinary
 * dictionaries, varint segment rows, delta-varint postings, and a binary
 * postings pointer table.
 */

import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { ROOT, TOKEN_SHARDS } from "./config.mjs";
import { encodeDeltaSorted, encodeRows } from "./packed_varint.mjs";
import { writeAwtsmoosArray, writeAwtsmoosJson, writeJsonFallback } from "./super_packed_binary_io.mjs";

const DEFAULT_OUT = path.join(ROOT, "searchPacked", "ikar.hebrew.superpacked.from-shards.awtsidx");
const STATUS_PATH = path.join(ROOT, ".awtsmoos", "tmp", "ikar-superpacked-compaction-status.json");
const CATEGORIES = ["other", "mishnah", "talmud_bavli", "chassidus", "rambam"];

function cliValue(name, fallback = "") { const arg = process.argv.find(item => item.startsWith(`--${name}=`)); return arg ? arg.split("=").slice(1).join("=") : fallback; }
function numberArg(name, fallback) { const n = Number(cliValue(name, fallback)); return Number.isFinite(n) ? Math.floor(n) : fallback; }
function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function readJson(file) { return JSON.parse(fs.readFileSync(file, "utf8")); }
function writeStatus(value) { ensureDir(path.dirname(STATUS_PATH)); fs.writeFileSync(STATUS_PATH, JSON.stringify({ ...value, updatedAt: new Date().toISOString() }, null, 2)); }
function dictIndex(map, list, value) { const key = String(value || ""); if (map.has(key)) return map.get(key); const index = list.length; list.push(key); map.set(key, index); return index; }
function refKey(ref) { return `${ref.seriesId || ""}\u0000${ref.postId || ""}\u0000${ref.path || ""}\u0000${ref.category || "other"}`; }
function bytesOfFiles(dir) { let total = 0; if (!fs.existsSync(dir)) return 0; for (const e of fs.readdirSync(dir, { withFileTypes: true })) { const p = path.join(dir, e.name); total += e.isDirectory() ? bytesOfFiles(p) : fs.statSync(p).size; } return total; }

async function runWorker({ inputDir, outDir, shard }) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(ROOT, "scripts/ikar_hebrew_index/compact_existing_shard_worker.mjs"), `--input=${inputDir}`, `--out=${outDir}`, `--shard=${shard}`], { cwd: ROOT, stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", chunk => { stdout += chunk; });
    child.stderr.on("data", chunk => { stderr += chunk; });
    child.on("exit", code => {
      if (code !== 0) reject(new Error(`worker shard ${shard} failed ${code}: ${stderr}`));
      else resolve(JSON.parse(stdout));
    });
  });
}

async function runWorkers({ inputDir, outDir, maxParallel, maxShards }) {
  const shards = Array.from({ length: Math.min(TOKEN_SHARDS, maxShards || TOKEN_SHARDS) }, (_, i) => i);
  const results = [];
  let next = 0;
  async function lane() {
    while (next < shards.length) {
      const shard = shards[next++];
      writeStatus({ status: "worker-compacting", inputDir, outDir, doneWorkers: results.length, totalWorkers: shards.length, currentShard: shard });
      results.push(await runWorker({ inputDir, outDir, shard }));
    }
  }
  await Promise.all(Array.from({ length: Math.min(maxParallel, shards.length) }, lane));
  return results;
}

function mergePartial(partial, global) {
  for (const ref of partial.segments) {
    const key = refKey(ref);
    if (global.refToDense.has(key)) continue;
    const dense = global.segmentRows.length;
    const seriesIndex = dictIndex(global.seriesMap, global.series, ref.seriesId);
    const postIndex = dictIndex(global.postMap, global.posts, ref.postId);
    const pathIndex = dictIndex(global.pathMap, global.paths, ref.path);
    const categoryIndex = Math.max(0, CATEGORIES.indexOf(ref.category || "other"));
    global.refToDense.set(key, dense);
    global.oldToDense.set(String(ref.segmentId), dense);
    global.segmentRows.push([dense, seriesIndex, postIndex, pathIndex, categoryIndex, 0]);
  }
  for (const [token, oldIds] of Object.entries(partial.postings || {})) {
    const tokenIndex = dictIndex(global.tokenMap, global.tokens, token);
    let list = global.postings.get(tokenIndex);
    if (!list) { list = []; global.postings.set(tokenIndex, list); }
    for (const oldId of oldIds) {
      const dense = global.oldToDense.get(String(oldId));
      if (dense !== undefined) list.push(dense);
    }
  }
}

async function writeFinal(outDir, global, stats) {
  ensureDir(outDir);
  fs.writeFileSync(path.join(outDir, "segments.rows.bin"), encodeRows(global.segmentRows));
  const tokenIndexes = [...global.postings.keys()].sort((a, b) => a - b);
  const postingChunks = [];
  const indexRows = [];
  let offset = 0;
  for (const tokenIndex of tokenIndexes) {
    const ids = [...new Set(global.postings.get(tokenIndex))].sort((a, b) => a - b);
    const chunk = encodeDeltaSorted(ids);
    indexRows.push([tokenIndex, offset, chunk.length, ids.length]);
    postingChunks.push(chunk);
    offset += chunk.length;
  }
  fs.writeFileSync(path.join(outDir, "postings.bin"), Buffer.concat(postingChunks));
  fs.writeFileSync(path.join(outDir, "postings.index.rows.bin"), encodeRows(indexRows));
  await writeAwtsmoosArray(path.join(outDir, "series.dict.awtsbin"), global.series);
  await writeAwtsmoosArray(path.join(outDir, "posts.dict.awtsbin"), global.posts);
  await writeAwtsmoosArray(path.join(outDir, "paths.dict.awtsbin"), global.paths);
  await writeAwtsmoosArray(path.join(outDir, "tokens.dict.awtsbin"), global.tokens);
  const meta = {
    kind: "ikar-hebrew-super-packed-from-existing-shards",
    version: 2,
    layout: "awtsmoos-binary-dicts-varint-rows-delta-postings-binary-index",
    rowWidth: 6,
    postingIndexRowWidth: 4,
    categories: CATEGORIES,
    stats,
    dictionaries: { series: global.series.length, posts: global.posts.length, paths: global.paths.length, tokens: global.tokens.length },
    bytes: 0,
    completedAt: new Date().toISOString()
  };
  await writeAwtsmoosJson(path.join(outDir, "meta.awtsbin"), meta);
  meta.bytes = bytesOfFiles(outDir);
  writeJsonFallback(path.join(outDir, "meta.readable.json"), meta);
  return meta;
}

export async function compactExistingShards({ inputDir, outDir = DEFAULT_OUT, workerDir = path.join(ROOT, ".awtsmoos", "tmp", "ikar-superpacked-compaction-work", String(Date.now())), maxParallel = 8, maxShards = TOKEN_SHARDS } = {}) {
  if (!inputDir || !fs.existsSync(inputDir)) throw new Error(`Missing input shard dir ${inputDir}`);
  ensureDir(workerDir);
  ensureDir(outDir);
  const startedAt = new Date().toISOString();
  writeStatus({ status: "starting", inputDir, outDir, workerDir, startedAt });
  const workerResults = await runWorkers({ inputDir, outDir: workerDir, maxParallel, maxShards });
  writeStatus({ status: "merging", inputDir, outDir, workerDir, workerResults: workerResults.length });
  const global = { series: [], posts: [], paths: [], tokens: [], seriesMap: new Map(), postMap: new Map(), pathMap: new Map(), tokenMap: new Map(), refToDense: new Map(), oldToDense: new Map(), segmentRows: [], postings: new Map() };
  const partialFiles = fs.readdirSync(path.join(workerDir, "partials")).filter(name => name.endsWith(".json")).sort().map(name => path.join(workerDir, "partials", name));
  for (const file of partialFiles) mergePartial(readJson(file), global);
  const stats = { startedAt, inputDir, workerDir, workerResults, partials: partialFiles.length, segments: global.segmentRows.length, tokenRefs: [...global.postings.values()].reduce((sum, list) => sum + list.length, 0) };
  const meta = await writeFinal(outDir, global, stats);
  writeStatus({ status: "complete", inputDir, outDir, workerDir, meta });
  return meta;
}

if (process.argv[1]?.endsWith("compact_existing_shards_coordinator.mjs")) {
  console.log(JSON.stringify(await compactExistingShards({
    inputDir: path.resolve(ROOT, cliValue("input", "")),
    outDir: path.resolve(ROOT, cliValue("out", DEFAULT_OUT)),
    maxParallel: Math.max(1, numberArg("parallel", 8)),
    maxShards: Math.max(1, numberArg("max-shards", TOKEN_SHARDS))
  }), null, 2));
}
