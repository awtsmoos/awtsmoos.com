// B"H
const childProcess = require("child_process");
const fsp = require("fs/promises");
const crypto = require("crypto");
const os = require("os");
const { safePath } = require("./pathGuard.js");
const { ensureGitignoreHygiene } = require("./gitIgnoreHygiene.js");

const DIR = ".awtsmoos/command-jobs";
const TTL_MS = 2 * 60 * 60 * 1000;
const DEFAULT_PAGE_CHARS = 12000;
const MAX_PAGE_CHARS = 250000;
const DEFAULT_HTTP_SAFE_WAIT_MS = 25000;
const TORAH_UNLIMITED_WAIT_MS = 24 * 60 * 60 * 1000;
const TERMINAL_STATUSES = new Set(["completed", "failed", "timed_out", "cancelled"]);
const JOBS = new Map();

async function startCommandJob(config = {}, payload = {}) {
  if (!allowed(config, payload)) return { ok: false, action: "commandStart", error: "commands_disabled" };
  const command = String(payload.command || payload.script || payload.text || "").trim();
  if (!command) return { ok: false, action: "commandStart", error: "missing_command" };
  await ensure(config);
  const jobId = `cmdjob_${Date.now().toString(36)}_${crypto.randomBytes(6).toString("hex")}`;
  const cwd = resolveCwd(config, payload);
  const shell = payload.shell || defaultShell();
  const timeoutMs = boundedTimeout(payload.timeoutMs || 24 * 60 * 60 * 1000);
  const relDir = `${DIR}/${jobId}`;
  await fsp.mkdir(safePath(config, relDir), { recursive: true });
  await fsp.writeFile(safePath(config, `${relDir}/stdout.txt`), "", "utf8");
  await fsp.writeFile(safePath(config, `${relDir}/stderr.txt`), "", "utf8");
  const meta = {
    BH: "B\"H", jobId, action: "commandStart", command, cwd, shell,
    startedAt: new Date().toISOString(), status: "running", exitCode: null,
    signal: null, timedOut: false, stdoutChars: 0, stderrChars: 0, timeoutMs
  };
  await writeMeta(config, jobId, meta);
  const child = childProcess.spawn(command, { cwd, shell, windowsHide: true, detached: false });
  const live = { child, meta, writes: [], chains: { stdout: Promise.resolve(), stderr: Promise.resolve() } };
  const timer = setTimeout(() => { meta.timedOut = true; killChild(child); }, timeoutMs);
  JOBS.set(jobId, live);
  child.stdout.on("data", chunk => append(config, jobId, "stdout", chunk));
  child.stderr.on("data", chunk => append(config, jobId, "stderr", chunk));
  child.on("error", async error => finishJob(config, jobId, meta, { status: "failed", error: error.message, timer }));
  child.on("close", async (code, signal) => {
    const status = code === 0 ? "completed" : meta.timedOut ? "timed_out" : "failed";
    await finishJob(config, jobId, meta, { status, exitCode: code, signal, timer });
  });
  return startResponse(jobId, { command, cwd, shell, timeoutMs });
}

function startResponse(jobId, details) {
  return {
    ok: true, action: "commandStart", jobId, status: "running", ...details,
    statusPayload: { action: "commandStatus", jobId },
    waitPayload: { action: "commandWait", jobId, waitTimeoutMs: waitCapMs(), pollIntervalMs: 1000 },
    stdoutPagePayload: { action: "commandJobOutputPage", jobId, stream: "stdout", offsetChars: 0, maxChars: DEFAULT_PAGE_CHARS },
    stderrPagePayload: { action: "commandJobOutputPage", jobId, stream: "stderr", offsetChars: 0, maxChars: DEFAULT_PAGE_CHARS },
    aiInstructions: "Command is running asynchronously. Use commandWait for one-call completion, commandStatus for polling, and commandJobOutputPage for paged logs."
  };
}

/**
 * B"H
 * Chapter 532: The first sparks are no longer trampled by the chariot.
 * Node may deliver stdout in bursts while the close event is already racing
 * toward final metadata. The old store counted promises as if they had landed.
 * This version records every append promise, waits for the living sparks before
 * counts and pages, and lets maxChars mean what the caller actually asked.
 */
async function finishJob(config, jobId, meta, patch = {}) {
  clearTimeout(patch.timer);
  await waitForWrites(jobId);
  const current = await readMeta(config, jobId);
  const base = current && TERMINAL_STATUSES.has(current.status) ? current : meta;
  const finalMeta = { ...base, ...patch, finishedAt: base.finishedAt || new Date().toISOString() };
  delete finalMeta.timer;
  await refreshCounts(config, jobId, finalMeta);
  await writeMeta(config, jobId, finalMeta);
  JOBS.delete(jobId);
  return finalMeta;
}

async function commandStatus(config = {}, payload = {}) {
  const jobId = cleanId(payload.jobId || payload.id || "");
  if (!jobId) return { ok: false, action: "commandStatus", error: "missing_jobId", status: "missing_jobId" };
  await waitForWrites(jobId);
  const meta = await readMeta(config, jobId);
  if (!meta) return { ok: false, action: "commandStatus", error: "job_not_found_or_expired", status: "missing", jobId };
  await refreshCounts(config, jobId, meta);
  const live = JOBS.get(jobId);
  if (live && !TERMINAL_STATUSES.has(meta.status)) {
    meta.status = live.meta.status || meta.status;
    meta.timedOut = Boolean(live.meta.timedOut || meta.timedOut);
  }
  return statusResponse(jobId, meta, payload);
}

async function commandWait(config = {}, payload = {}) {
  const jobId = cleanId(payload.jobId || payload.id || "");
  if (!jobId) return { ok: false, action: "commandWait", error: "missing_jobId", status: "missing_jobId" };
  const requestedTimeoutMs = Number(payload.waitTimeoutMs || payload.timeoutMs || waitCapMs());
  const capMs = waitCapMs(payload);
  const timeoutMs = Math.min(Number.isFinite(requestedTimeoutMs) ? requestedTimeoutMs : capMs, capMs);
  const intervalMs = Math.max(25, Math.min(Number(payload.intervalMs || payload.pollIntervalMs || 1000), 30000));
  const startedAt = Date.now();
  let status = null;
  while (Date.now() - startedAt <= timeoutMs) {
    status = await commandStatus(config, { ...payload, jobId });
    if (!status.ok || status.status !== "running") {
      await waitForWrites(jobId);
      const pageChars = payload.maxChars || DEFAULT_PAGE_CHARS;
      const stdout = payload.inlineOutput === false ? null : await commandJobOutputPage(config, { jobId, stream: "stdout", maxChars: pageChars });
      const stderr = payload.inlineOutput === false ? null : await commandJobOutputPage(config, { jobId, stream: "stderr", maxChars: pageChars });
      return { ...status, action: "commandWait", done: true, waitedMs: Date.now() - startedAt, stdout, stderr };
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  return waitTimeout(jobId, status, capMs, intervalMs, startedAt, payload);
}

async function commandJobOutputPage(config = {}, payload = {}) {
  const jobId = cleanId(payload.jobId || payload.id || "");
  if (!jobId) return { ok: false, action: "commandJobOutputPage", error: "missing_jobId" };
  const stream = String(payload.stream || "stdout").toLowerCase() === "stderr" ? "stderr" : "stdout";
  await waitForWrites(jobId);
  const meta = await readMeta(config, jobId);
  if (!meta) return { ok: false, action: "commandJobOutputPage", error: "job_not_found_or_expired", jobId };
  const text = await readText(config, `${DIR}/${jobId}/${stream}.txt`);
  const offset = Math.max(0, Math.floor(Number(payload.offsetChars || payload.offset || 0)));
  const maxChars = boundedPageChars(payload.maxChars || payload.pageChars || DEFAULT_PAGE_CHARS);
  const content = text.slice(offset, offset + maxChars);
  const nextOffsetChars = offset + content.length < text.length ? offset + content.length : null;
  return {
    BH: "B\"H", ok: true, action: "commandJobOutputPage", jobId, stream, status: meta.status,
    offsetChars: offset, returnedChars: content.length, totalChars: text.length, content,
    hasNextPage: nextOffsetChars !== null, nextOffsetChars,
    nextPagePayload: nextOffsetChars === null ? null : { action: "commandJobOutputPage", jobId, stream, offsetChars: nextOffsetChars, maxChars }
  };
}

async function cancelCommandJob(config = {}, payload = {}) {
  const jobId = cleanId(payload.jobId || payload.id || "");
  if (!jobId) return { ok: false, action: "commandCancel", error: "missing_jobId" };
  const live = JOBS.get(jobId);
  if (live) {
    killChild(live.child);
    live.meta.status = "cancelled";
    live.meta.finishedAt = new Date().toISOString();
    await waitForWrites(jobId);
    await refreshCounts(config, jobId, live.meta);
    await writeMeta(config, jobId, live.meta);
    JOBS.delete(jobId);
    return { ok: true, action: "commandCancel", jobId, cancelled: true };
  }
  const meta = await readMeta(config, jobId);
  return { ok: true, action: "commandCancel", jobId, cancelled: false, status: meta?.status || "missing" };
}

function waitTimeout(jobId, status, capMs, intervalMs, startedAt, payload) {
  return {
    ok: true, action: "commandWait", status: status?.status === "running" ? "running" : "wait_timeout",
    done: false, waitTimedOut: true, httpSafeWaitMs: capMs, torahUnlimitedWait: torahUnlimitedEnabled(payload),
    waitedMs: Date.now() - startedAt, lastStatus: status, statusPayload: { action: "commandStatus", jobId },
    nextWaitPayload: { action: "commandWait", jobId, waitTimeoutMs: capMs, pollIntervalMs: intervalMs }
  };
}

async function append(config, jobId, stream, chunk) {
  const live = JOBS.get(jobId);
  const text = Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk || "");
  if (live) live.meta[`${stream}Chars`] = Number(live.meta[`${stream}Chars`] || 0) + text.length;
  const write = enqueueStreamWrite(config, jobId, stream, text, live);
  if (live) {
    live.writes.push(write);
    write.finally(() => { live.writes = live.writes.filter(item => item !== write); });
  }
  await write;
}

/**
 * B"H
 * Chapter 537: The stream sparks now walk single-file through the gate.
 * Burst chunks may arrive in order, yet unordered append promises can overtake
 * one another on disk. Each stream receives its own chain, preserving stdout
 * and stderr order while still allowing both rivers to flow at once.
 */
function enqueueStreamWrite(config, jobId, stream, text, live) {
  const file = safePath(config, `${DIR}/${jobId}/${stream}.txt`);
  if (!live) return fsp.appendFile(file, text, "utf8").catch(() => {});
  const previous = live.chains?.[stream] || Promise.resolve();
  const next = previous.then(() => fsp.appendFile(file, text, "utf8")).catch(() => {});
  live.chains[stream] = next.catch(() => {});
  return next;
}

async function waitForWrites(jobId) {
  const live = JOBS.get(jobId);
  if (!live || !live.writes.length) return;
  await Promise.allSettled([...live.writes]);
}

function torahUnlimitedEnabled(payload = {}) {
  const raw = payload.torahUnlimitedWait ?? payload.unlimitedWait ?? process.env.AWTSMOOS_TORAH_UNLIMITED_WAIT ?? process.env.AWTSMOOS_UNLIMITED_WAIT ?? "";
  return raw === true || ["1", "true", "yes", "on"].includes(String(raw).toLowerCase());
}
function waitCapMs(payload = {}) {
  if (torahUnlimitedEnabled(payload)) return boundedWaitMs(payload.maxWaitMs || process.env.AWTSMOOS_MAX_WAIT_MS || TORAH_UNLIMITED_WAIT_MS);
  return boundedWaitMs(process.env.AWTSMOOS_HTTP_SAFE_WAIT_MS || DEFAULT_HTTP_SAFE_WAIT_MS);
}
function boundedWaitMs(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(100, Math.min(Math.floor(n), TORAH_UNLIMITED_WAIT_MS)) : DEFAULT_HTTP_SAFE_WAIT_MS;
}
function statusResponse(jobId, meta, payload = {}) {
  const maxChars = boundedPageChars(payload.maxChars || DEFAULT_PAGE_CHARS);
  return {
    ...meta, ok: true, action: "commandStatus", running: meta.status === "running",
    stdoutPagePayload: { action: "commandJobOutputPage", jobId, stream: "stdout", offsetChars: Math.max(0, Number(payload.stdoutOffsetChars || 0)), maxChars },
    stderrPagePayload: { action: "commandJobOutputPage", jobId, stream: "stderr", offsetChars: Math.max(0, Number(payload.stderrOffsetChars || 0)), maxChars }
  };
}
async function ensure(config) {
  await fsp.mkdir(safePath(config, DIR), { recursive: true });
  await ensureGitignoreHygiene(config, "command-job-store");
  await garbageCollect(config);
}
async function garbageCollect(config) {
  const root = safePath(config, DIR);
  let entries = [];
  try { entries = await fsp.readdir(root, { withFileTypes: true }); } catch (_) { return; }
  const now = Date.now();
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const stat = await fsp.stat(safePath(config, `${DIR}/${entry.name}/meta.json`)).catch(() => null);
    if (stat && now - stat.mtimeMs > TTL_MS) await fsp.rm(safePath(config, `${DIR}/${entry.name}`), { recursive: true, force: true }).catch(() => {});
  }
}
async function refreshCounts(config, jobId, meta) {
  meta.stdoutChars = (await readText(config, `${DIR}/${jobId}/stdout.txt`)).length;
  meta.stderrChars = (await readText(config, `${DIR}/${jobId}/stderr.txt`)).length;
  return meta;
}
async function writeMeta(config, jobId, meta) {
  const dir = `${DIR}/${jobId}`;
  const tmp = `${dir}/meta.${process.pid}.${Date.now()}.${crypto.randomBytes(4).toString("hex")}.tmp`;
  await fsp.writeFile(safePath(config, tmp), JSON.stringify(meta, null, 2), "utf8");
  await fsp.rename(safePath(config, tmp), safePath(config, `${dir}/meta.json`));
}
async function readMeta(config, jobId) {
  for (let attempt = 0; attempt < 8; attempt++) {
    try { return JSON.parse(await fsp.readFile(safePath(config, `${DIR}/${jobId}/meta.json`), "utf8")); }
    catch (_) { if (attempt === 7) return null; await new Promise(resolve => setTimeout(resolve, 5 + attempt * 5)); }
  }
  return null;
}
async function readText(config, rel) { try { return await fsp.readFile(safePath(config, rel), "utf8"); } catch (_) { return ""; } }
function killChild(child) { try { child.kill("SIGTERM"); } catch (_) {} }
function allowed(config = {}, payload = {}) { return config.allowCommands === true || payload.allowCommands === true || String(payload.allowCommands).toLowerCase() === "true"; }
function resolveCwd(config, payload) { try { return safePath(config, payload.cwd || payload.path || payload.p || "."); } catch (_) { return config.root || process.cwd(); } }
function boundedTimeout(value) { const n = Number(value || 24 * 60 * 60 * 1000); return Math.max(100, Math.min(Number.isFinite(n) ? n : 120000, 24 * 60 * 60 * 1000)); }
function boundedPageChars(value) { const n = Number(value || DEFAULT_PAGE_CHARS); return Math.max(1, Math.min(Number.isFinite(n) ? Math.floor(n) : DEFAULT_PAGE_CHARS, MAX_PAGE_CHARS)); }
function defaultShell() { return os.platform() === "win32" ? process.env.ComSpec || "cmd.exe" : "/bin/sh"; }
function cleanId(value) { return String(value || "").replace(/[^a-zA-Z0-9_-]/g, ""); }

module.exports = { startCommandJob, commandStatus, commandWait, commandJobOutputPage, cancelCommandJob };
