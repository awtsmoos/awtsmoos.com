// B"H
/**
 * @file index_builder.mjs
 * @chapter The Clean Parallel Sea, Where No Worker Touches Another Worker's Ink
 * @description
 * Parallel Ikar Hebrew indexing coordinator + worker. The coordinator owns the
 * process lock, heartbeat, manifest, child supervision, and final AwtsmoosDB
 * packing. Workers only read source series and write isolated JSONL shard files
 * under workers/<id>/, so 200 workers can run without interleaving writes.
 *
 * Important restart law: old sequential mixed shard folders are preserved but
 * not trusted for reuse, because they may contain partial-series lines after a
 * forced stop. This clean parallel run may re-read a small amount already seen
 * by the earlier sequential run, but it prevents poisoned final indexes. Future
 * progress is durable through per-worker completed manifests and live progress.
 */

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { ROOT, SOURCE_DB_ROOT, TOKEN_SHARDS } from "./config.mjs";
import { inferCategory, iterateIkarSeriesSegments, listSeriesIds, openLegacyDb } from "./ikar_reader.mjs";
import { closeIndexDb, metaPath, openIndexDb, segmentShardPath, shardForToken, tokenShardPath, writeJson } from "./db_io.mjs";

const THIS_FILE = fileURLToPath(import.meta.url);
const RUN_ID = process.env.IKAR_HEBREW_INDEX_RUN_ID || `${Date.now()}-${process.pid}`;
const TMP_ROOT = path.join(ROOT, ".awtsmoos", "tmp");
const WORK_ROOT = path.join(TMP_ROOT, "ikar-hebrew-index-work");
const LOCK_PATH = path.join(TMP_ROOT, "ikar-hebrew-index.lock");
const PROGRESS_PATH = path.join(TMP_ROOT, "ikar-hebrew-index-progress.json");
const COMPLETED_FILE = "completed_series.json";
const HEARTBEAT_FILE = "progress.json";
const WORKER_PROGRESS = "worker_progress.json";

function isCli() { return process.argv[1] === THIS_FILE; }
function hasFlag(flag) { return process.argv.includes(flag); }
function argValue(name, fallback = "") { const found = process.argv.find(arg => arg.startsWith(`--${name}=`)); return found ? found.split("=").slice(1).join("=") : fallback; }
function intArg(name, fallback, min = 1, max = 512) { const n = Number(argValue(name, fallback)); return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.floor(n))) : fallback; }
function nowIso() { return new Date().toISOString(); }
function workDir() { return path.join(WORK_ROOT, RUN_ID); }
function workerDir(workerId) { return path.join(workDir(), "workers", String(workerId).padStart(4, "0")); }
function manifestPath(dir = workDir()) { return path.join(dir, COMPLETED_FILE); }
function heartbeatPath(dir = workDir()) { return path.join(dir, HEARTBEAT_FILE); }
function shardFile(baseDir, kind, shard) { return path.join(baseDir, `${kind}-${String(shard).padStart(2, "0")}.jsonl`); }
function segmentShard(segmentId) { return Math.abs(Number(segmentId)) % TOKEN_SHARDS; }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function appendJsonLine(file, value) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.appendFileSync(file, `${JSON.stringify(value)}\n`); }
function readJsonFile(file, fallback) { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return fallback; } }
function writeJsonFile(file, value) { fs.mkdirSync(path.dirname(file), { recursive: true }); const tmp = `${file}.${process.pid}.tmp`; fs.writeFileSync(tmp, JSON.stringify(value, null, 2)); fs.renameSync(tmp, file); }

function acquireBuildLock() {
  fs.mkdirSync(path.dirname(LOCK_PATH), { recursive: true });
  try {
    const fd = fs.openSync(LOCK_PATH, "wx");
    fs.writeFileSync(fd, JSON.stringify({ pid: process.pid, runId: RUN_ID, at: nowIso(), mode: "parallel-coordinator" }));
    fs.closeSync(fd);
  } catch {
    const existing = fs.existsSync(LOCK_PATH) ? fs.readFileSync(LOCK_PATH, "utf8") : "unknown";
    throw new Error(`IKAR_INDEX_ALREADY_RUNNING ${existing}`);
  }
}
function releaseBuildLock() { try { fs.rmSync(LOCK_PATH, { force: true }); } catch {} }

function defaultManifest() { return { kind: "ikar-hebrew-completed-series-v2", runId: RUN_ID, completed: [], series: {}, updatedAt: nowIso() }; }
function loadManifest(dir = workDir()) { const m = readJsonFile(manifestPath(dir), defaultManifest()); m.completed ||= []; m.series ||= {}; return m; }
function saveManifest(manifest) { manifest.updatedAt = nowIso(); writeJsonFile(manifestPath(), manifest); }

function allFilesNamed(dir, name, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) allFilesNamed(p, name, out);
    else if (entry.name === name) out.push(p);
  }
  return out;
}

function shardFiles(kind, dir = workDir(), out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) shardFiles(kind, p, out);
    else if (entry.isFile() && new RegExp(`^${kind}-\\d{2}\\.jsonl$`).test(entry.name)) out.push(p);
  }
  return out;
}

function tempShardBytes() {
  let total = 0;
  for (const file of [...shardFiles("segments"), ...shardFiles("tokens")]) total += fs.statSync(file).size;
  return total;
}

function refOf(segment) {
  return { segmentId: segment.segmentId, heichelId: segment.heichelId, seriesId: segment.seriesId, category: segment.category, postId: segment.postId, postTitle: segment.postTitle, segmentPath: segment.segmentPath, hebrewPreview: segment.hebrewPreview };
}

function estimateRemaining(startedAt, completed, total) {
  if (!completed || !total || completed >= total) return "unknown";
  const elapsed = Date.now() - Date.parse(startedAt);
  if (!Number.isFinite(elapsed) || elapsed <= 0) return "unknown";
  const ms = elapsed * (total - completed) / completed;
  const minutes = Math.round(ms / 60000);
  if (minutes < 2) return `${Math.round(ms / 1000)}s`;
  if (minutes < 180) return `${minutes}m`;
  return `${Math.round(minutes / 60)}h`;
}

function heartbeat(state, patch = {}) {
  Object.assign(state, patch, { updatedAt: nowIso(), tempShardBytes: tempShardBytes() });
  state.percent = state.totalSeries ? Number(((state.completedSeries / state.totalSeries) * 100).toFixed(2)) : 0;
  state.estimatedRemaining = estimateRemaining(state.startedAt, state.completedSeries, state.totalSeries);
  writeJsonFile(PROGRESS_PATH, state);
  writeJsonFile(heartbeatPath(), state);
}

async function readJsonLines(file, onValue) {
  if (!fs.existsSync(file)) return;
  const rl = readline.createInterface({ input: fs.createReadStream(file, "utf8"), crlfDelay: Infinity });
  for await (const line of rl) if (line) await onValue(JSON.parse(line));
}

function writeWorkerProgress(workerId, patch) {
  const file = path.join(workerDir(workerId), WORKER_PROGRESS);
  const current = readJsonFile(file, { workerId, startedAt: nowIso(), status: "running", completedSeries: 0, segmentsIndexed: 0, tokenRefs: 0 });
  writeJsonFile(file, { ...current, ...patch, updatedAt: nowIso() });
}

async function runWorker() {
  const workerId = Number(argValue("worker-id", process.env.IKAR_WORKER_ID || 0));
  const workerTotal = Number(argValue("worker-total", process.env.IKAR_WORKER_TOTAL || 1));
  const base = workerDir(workerId);
  fs.mkdirSync(base, { recursive: true });
  const allSeries = listSeriesIds().filter(id => inferCategory(id) !== "tanach");
  const assigned = allSeries.filter((_, index) => index % workerTotal === workerId);
  const manifest = { kind: "ikar-hebrew-worker-completed-series-v2", runId: RUN_ID, workerId, completed: [], series: {}, updatedAt: nowIso() };
  const stats = { workerId, assignedSeries: assigned.length, segments: 0, tokenRefs: 0, byCategory: {}, bySeries: {}, errors: [] };
  const db = await openLegacyDb();
  let localSegment = workerId * 1_000_000_000_000;
  try {
    writeWorkerProgress(workerId, { assignedSeries: assigned.length, currentSeries: "" });
    for (const seriesId of assigned) {
      const category = inferCategory(seriesId);
      let seriesSegments = 0;
      let seriesTokenRefs = 0;
      writeWorkerProgress(workerId, { currentSeries: seriesId });
      for await (const segment of iterateIkarSeriesSegments(db, seriesId, { startSegmentId: localSegment })) {
        if (segment.error) { stats.errors.push(segment); continue; }
        const ref = refOf(segment);
        appendJsonLine(shardFile(base, "segments", segmentShard(segment.segmentId)), { ...ref, author: segment.author, createdAt: segment.createdAt, normalizedHebrew: segment.normalizedHebrew, tokens: segment.tokens });
        stats.segments++; seriesSegments++; stats.bySeries[seriesId] = (stats.bySeries[seriesId] || 0) + 1; stats.byCategory[segment.category] = (stats.byCategory[segment.category] || 0) + 1;
        for (const token of segment.tokens) { stats.tokenRefs++; seriesTokenRefs++; appendJsonLine(shardFile(base, "tokens", shardForToken(token)), { token, ref }); }
        localSegment = Math.max(localSegment, segment.segmentId + 1);
        if (stats.segments % 1000 === 0) writeWorkerProgress(workerId, { segmentsIndexed: stats.segments, tokenRefs: stats.tokenRefs });
      }
      manifest.completed.push(seriesId);
      manifest.series[seriesId] = { completedAt: nowIso(), category, segments: seriesSegments, tokenRefs: seriesTokenRefs, lastSegmentId: localSegment - 1 };
      manifest.updatedAt = nowIso();
      writeJsonFile(path.join(base, COMPLETED_FILE), manifest);
      writeWorkerProgress(workerId, { completedSeries: manifest.completed.length, segmentsIndexed: stats.segments, tokenRefs: stats.tokenRefs });
    }
    writeJsonFile(path.join(base, "worker_stats.json"), stats);
    writeWorkerProgress(workerId, { status: "complete", currentSeries: "" });
  } catch (error) {
    writeWorkerProgress(workerId, { status: "failed", error: error.message });
    throw error;
  } finally {
    db.closeAwtsmoosDbFsRouter?.();
  }
}

function readWorkerTotals() {
  const totals = { completedSeries: 0, assignedSeries: 0, segmentsIndexed: 0, tokenRefs: 0, activeWorkers: 0, failedWorkers: 0, currentSeries: [] };
  for (const file of allFilesNamed(path.join(workDir(), "workers"), WORKER_PROGRESS)) {
    const p = readJsonFile(file, null); if (!p) continue;
    totals.completedSeries += Number(p.completedSeries || 0);
    totals.assignedSeries += Number(p.assignedSeries || 0);
    totals.segmentsIndexed += Number(p.segmentsIndexed || 0);
    totals.tokenRefs += Number(p.tokenRefs || 0);
    if (p.status === "running") totals.activeWorkers++;
    if (p.status === "failed") totals.failedWorkers++;
    if (p.currentSeries) totals.currentSeries.push(`${p.workerId}:${p.currentSeries}`);
  }
  return totals;
}

function spawnWorkers(count) {
  const children = [];
  for (let workerId = 0; workerId < count; workerId++) {
    children.push(spawn(process.execPath, [THIS_FILE, "--worker", `--worker-id=${workerId}`, `--worker-total=${count}`], { cwd: ROOT, env: { ...process.env, IKAR_HEBREW_INDEX_RUN_ID: RUN_ID }, stdio: ["ignore", "ignore", "inherit"], windowsHide: true }));
  }
  return children;
}

async function waitWorkers(children, state) {
  let done = 0;
  const failures = [];
  for (const child of children) child.on("exit", code => { done++; if (code !== 0) failures.push({ pid: child.pid, code }); });
  while (done < children.length) {
    const totals = readWorkerTotals();
    heartbeat(state, { status: "running", completedSeries: totals.completedSeries, segmentsIndexed: totals.segmentsIndexed, tokenRefs: totals.tokenRefs, activeWorkers: children.length - done, failedWorkers: totals.failedWorkers, currentSeries: totals.currentSeries.slice(0, 16).join(", ") || "workers starting" });
    await sleep(5000);
  }
  await sleep(1000);
  const totals = readWorkerTotals();
  heartbeat(state, { completedSeries: totals.completedSeries, segmentsIndexed: totals.segmentsIndexed, tokenRefs: totals.tokenRefs, activeWorkers: 0, currentSeries: "workers complete" });
  if (failures.length) throw new Error(`IKAR_WORKERS_FAILED ${JSON.stringify(failures.slice(0, 20))}`);
  return totals;
}

function mergeWorkerManifests(manifest) {
  for (const file of allFilesNamed(path.join(workDir(), "workers"), COMPLETED_FILE)) {
    const wm = readJsonFile(file, null);
    if (!wm?.series) continue;
    for (const [seriesId, info] of Object.entries(wm.series)) manifest.series[seriesId] = info;
    for (const seriesId of wm.completed || []) if (!manifest.completed.includes(seriesId)) manifest.completed.push(seriesId);
  }
  manifest.completed.sort((a, b) => a.localeCompare(b));
  saveManifest(manifest);
  return manifest;
}

async function packShardFiles(db) {
  const shardSizes = [];
  let uniqueTokens = 0;
  for (let shard = 0; shard < TOKEN_SHARDS; shard++) {
    const key = String(shard).padStart(2, "0");
    const segments = [];
    for (const file of shardFiles("segments").filter(f => f.endsWith(`segments-${key}.jsonl`))) await readJsonLines(file, value => { segments.push(value); });
    writeJson(db, segmentShardPath(shard), { shard, segments });
    const tokens = Object.create(null);
    for (const file of shardFiles("tokens").filter(f => f.endsWith(`tokens-${key}.jsonl`))) await readJsonLines(file, value => { if (!tokens[value.token]) tokens[value.token] = []; tokens[value.token].push(value.ref); });
    const count = Object.keys(tokens).length;
    uniqueTokens += count;
    shardSizes.push(count);
    writeJson(db, tokenShardPath(shard), { shard, tokens });
    db.fs.flush();
  }
  return { shardSizes, uniqueTokens };
}

export async function buildIndex({ dbPath = "", workers = intArg("workers", Number(process.env.IKAR_INDEX_WORKERS || 200), 1, 512) } = {}) {
  acquireBuildLock();
  const startedAt = nowIso();
  try {
    fs.mkdirSync(workDir(), { recursive: true });
    const totalSeries = listSeriesIds().filter(seriesId => inferCategory(seriesId) !== "tanach").length;
    const manifest = defaultManifest();
    saveManifest(manifest);
    const state = { runId: RUN_ID, pid: process.pid, status: "running", mode: "parallel-clean", workers, currentSeries: "spawning workers", completedSeries: 0, totalSeries, percent: 0, segmentsIndexed: 0, tokenRefs: 0, tempShardBytes: 0, workDir: workDir(), startedAt, updatedAt: startedAt, estimatedRemaining: "unknown" };
    heartbeat(state);
    const children = spawnWorkers(workers);
    const totals = await waitWorkers(children, state);
    const merged = mergeWorkerManifests(manifest);
    heartbeat(state, { status: "packing", currentSeries: "packing shards", completedSeries: merged.completed.length, segmentsIndexed: totals.segmentsIndexed, tokenRefs: totals.tokenRefs });
    const { db, dbPath: resolvedDbPath } = openIndexDb(dbPath);
    try {
      const packed = await packShardFiles(db);
      const meta = { kind: "ikar-hebrew-index", version: 6, layout: "parallel-clean-isolated-worker-shards-to-packed-awtsmoosdb-v4", sourceDbRoot: SOURCE_DB_ROOT, dbPath: resolvedDbPath, tempWorkDir: workDir(), totalSeries, indexedSegments: totals.segmentsIndexed, tokenRefs: totals.tokenRefs, uniqueTokens: packed.uniqueTokens, tokenShards: TOKEN_SHARDS, shardSizes: packed.shardSizes, indexedSeries: merged.completed.length, completedSeriesManifest: manifestPath(), workers, startedAt, completedAt: nowIso() };
      writeJson(db, metaPath(), meta);
      db.fs.flush();
      heartbeat(state, { status: "complete", currentSeries: "", completedSeries: merged.completed.length, segmentsIndexed: totals.segmentsIndexed, tokenRefs: totals.tokenRefs, completedAt: meta.completedAt });
      return meta;
    } finally { closeIndexDb(db); }
  } catch (error) {
    const current = readJsonFile(PROGRESS_PATH, { runId: RUN_ID, startedAt });
    heartbeat(current, { status: "failed", error: error.message, failedAt: nowIso() });
    throw error;
  } finally { releaseBuildLock(); }
}

if (isCli()) {
  if (hasFlag("--worker")) await runWorker();
  else console.log(JSON.stringify(await buildIndex(), null, 2));
}
