// B"H
/**
 * @file compact_existing_shard_worker.mjs
 * @chapter The Old Shard Is Distilled Until Only Coordinates Remain
 * @description
 * Worker for converting existing JSONL shard files into a compact partial.
 * It reads assigned segments/tokens JSONL files, discards Hebrew previews,
 * normalized text, title/author repetition, and writes dictionaries + postings
 * as compact intermediate JSON. The coordinator later merges all partials into
 * one binary Awtsmoos-packed index.
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

function cliValue(name, fallback = "") {
  const arg = process.argv.find(item => item.startsWith(`--${name}=`));
  return arg ? arg.split("=").slice(1).join("=") : fallback;
}

function ensureDir(dir) { fs.mkdirSync(dir, { recursive: true }); }
function writeJson(file, value) { ensureDir(path.dirname(file)); fs.writeFileSync(file, JSON.stringify(value)); }

async function readLines(file, onValue) {
  if (!fs.existsSync(file)) return 0;
  let count = 0;
  const stream = readline.createInterface({ input: fs.createReadStream(file, "utf8"), crlfDelay: Infinity });
  for await (const line of stream) {
    if (!line) continue;
    count++;
    onValue(JSON.parse(line));
  }
  return count;
}

function listShardFiles(inputDir, kind, shard) {
  const suffix = `${kind}-${String(shard).padStart(2, "0")}.jsonl`;
  const out = [];
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.isFile() && entry.name === suffix) out.push(p);
    }
  }
  walk(inputDir);
  return out;
}

function refKey(ref) {
  return `${ref.segmentId}|${ref.seriesId || ""}|${ref.postId || ""}|${ref.segmentPath || ""}|${ref.category || "other"}`;
}

export async function compactShard({ inputDir, outDir, shard }) {
  const partial = {
    kind: "ikar-existing-shard-compact-partial-v1",
    shard,
    segments: [],
    postings: {},
    stats: { segmentLines: 0, tokenLines: 0, uniqueRefs: 0, uniqueTokens: 0 }
  };
  const seenSegments = new Set();
  for (const file of listShardFiles(inputDir, "segments", shard)) {
    partial.stats.segmentLines += await readLines(file, value => {
      const key = refKey(value);
      if (seenSegments.has(key)) return;
      seenSegments.add(key);
      partial.segments.push({
        segmentId: value.segmentId,
        seriesId: value.seriesId || "",
        postId: value.postId || "",
        path: value.segmentPath || "",
        category: value.category || "other"
      });
    });
  }
  const seenPostings = new Set();
  for (const file of listShardFiles(inputDir, "tokens", shard)) {
    partial.stats.tokenLines += await readLines(file, value => {
      if (!value?.token || !value?.ref) return;
      const segmentId = Number(value.ref.segmentId);
      if (!Number.isFinite(segmentId)) return;
      const key = `${value.token}\u0000${segmentId}`;
      if (seenPostings.has(key)) return;
      seenPostings.add(key);
      if (!partial.postings[value.token]) partial.postings[value.token] = [];
      partial.postings[value.token].push(segmentId);
      const rKey = refKey(value.ref);
      if (!seenSegments.has(rKey)) {
        seenSegments.add(rKey);
        partial.segments.push({ segmentId, seriesId: value.ref.seriesId || "", postId: value.ref.postId || "", path: value.ref.segmentPath || "", category: value.ref.category || "other" });
      }
    });
  }
  for (const ids of Object.values(partial.postings)) ids.sort((a, b) => a - b);
  partial.segments.sort((a, b) => a.segmentId - b.segmentId);
  partial.stats.uniqueRefs = partial.segments.length;
  partial.stats.uniqueTokens = Object.keys(partial.postings).length;
  const file = path.join(outDir, "partials", `partial-${String(shard).padStart(2, "0")}.json`);
  writeJson(file, partial);
  return { file, stats: partial.stats };
}

if (process.argv[1]?.endsWith("compact_existing_shard_worker.mjs")) {
  const inputDir = path.resolve(cliValue("input", ""));
  const outDir = path.resolve(cliValue("out", ""));
  const shard = Number(cliValue("shard", 0));
  console.log(JSON.stringify(await compactShard({ inputDir, outDir, shard }), null, 2));
}
