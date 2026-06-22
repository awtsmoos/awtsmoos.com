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
const TERMINAL_STATUSES = new Set(["completed", "failed", "timed_out", "cancelled"]);
const JOBS = new Map();

/**
 * B"H
 * Chapter 514: The watcher learned not to resurrect what the child had ended.
 *
 * A status reader is a witness, not a king. It may refresh counts in memory,
 * but it must never write an old running snapshot over the close handler's
 * completed truth. Under parallel waits, that old behavior turned tiny finished
 * commands into ghosts. The Awtsmoos breathes; the job dies once; the metadata
 * must not deny it.
 */
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
  const timer = setTimeout(() => { meta.timedOut = true; killChild(child); }, timeoutMs);
  JOBS.set(jobId, { child, meta });

  child.stdout.on("data", chunk => append(config, jobId, "stdout", chunk));
  child.stderr.on("data", chunk => append(config, jobId, "stderr", chunk));
  child.on("error", async error => finishJob(config, jobId, meta, { status: "failed", error: error.message, timer }));
  child.on("close", async (code, signal) => {
    const status = code === 0 ? "completed" : meta.timedOut ? "timed_out" : "failed";
    await finishJob(config, jobId, meta, { status, exitCode: code, signal, timer });
  });

  return {
    ok: true, action: "commandStart", jobId, status: "running", command, cwd, shell, timeoutMs,
    statusPayload: { action: "commandStatus", jobId },
    waitPayload: { action: "commandWait", jobId, waitTimeoutMs: timeoutMs, pollIntervalMs: 1000 },
    stdoutPagePayload: { action: "commandJobOutputPage", jobId, stream: "stdout", offsetChars: 0, maxChars: DEFAULT_PAGE_CHARS },
    stderrPagePayload: { action: "commandJobOutputPage", jobId, stream: "stderr", offsetChars: 0, maxChars: DEFAULT_PAGE_CHARS },
    aiInstructions: "Command is running asynchronously. Use commandWait for one-call completion, commandStatus for polling, and commandJobOutputPage for paged logs."
  };
}

async function finishJob(config, jobId, meta, patch = {}) {
  clearTimeout(patch.timer);
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
  if (!jobId) return { ok: false, action: "commandStatus", error: "missing_jobId" };
  const meta = await readMeta(config, jobId);
  if (!meta) return { ok: false, action: "commandStatus", error: "job_not_found_or_expired", jobId };
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
  if (!jobId) return { ok: false, action: "commandWait", error: "missing_jobId" };
  const timeoutMs = Math.min(Number(payload.waitTimeoutMs || payload.timeoutMs || 240000), 24 * 60 * 60 * 1000);
  const intervalMs = Math.max(25, Math.min(Number(payload.intervalMs || payload.pollIntervalMs || 1000), 30000));
  const startedAt = Date.now();
  let status = null;

  while (Date.now() - startedAt <= timeoutMs) {
    status = await commandStatus(config, { ...payload, jobId });
    if (!status.ok || status.status !== "running") {
      const stdout = payload.inlineOutput === false ? null : await commandJobOutputPage(config, { jobId, stream: "stdout", maxChars: payload.maxChars || DEFAULT_PAGE_CHARS });
      const stderr = payload.inlineOutput === false ? null : await commandJobOutputPage(config, { jobId, stream: "stderr", maxChars: payload.maxChars || DEFAULT_PAGE_CHARS });
      return { ...status, action: "commandWait", done: true, waitedMs: Date.now() - startedAt, stdout, stderr };
    }
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  return { ok: false, action: "commandWait", error: "wait_timeout", waitedMs: Date.now() - startedAt, lastStatus: status };
}

async function commandJobOutputPage(config = {}, payload = {}) {
  const jobId = cleanId(payload.jobId || payload.id || "");
  if (!jobId) return { ok: false, action: "commandJobOutputPage", error: "missing_jobId" };
  const stream = String(payload.stream || "stdout").toLowerCase() === "stderr" ? "stderr" : "stdout";
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
    await refreshCounts(config, jobId, live.meta);
    await writeMeta(config, jobId, live.meta);
    JOBS.delete(jobId);
    return { ok: true, action: "commandCancel", jobId, cancelled: true };
  }
  const meta = await readMeta(config, jobId);
  return { ok: true, action: "commandCancel", jobId, cancelled: false, status: meta?.status || "missing" };
}

function statusResponse(jobId, meta, payload = {}) {
  return {
    ok: true, action: "commandStatus", ...meta, running: meta.status === "running",
    stdoutPagePayload: { action: "commandJobOutputPage", jobId, stream: "stdout", offsetChars: Math.max(0, Number(payload.stdoutOffsetChars || 0)), maxChars: boundedPageChars(payload.maxChars || DEFAULT_PAGE_CHARS) },
    stderrPagePayload: { action: "commandJobOutputPage", jobId, stream: "stderr", offsetChars: Math.max(0, Number(payload.stderrOffsetChars || 0)), maxChars: boundedPageChars(payload.maxChars || DEFAULT_PAGE_CHARS) }
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

async function append(config, jobId, stream, chunk) {
  const live = JOBS.get(jobId);
  const text = Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk || "");
  if (live) live.meta[`${stream}Chars`] = Number(live.meta[`${stream}Chars`] || 0) + text.length;
  await fsp.appendFile(safePath(config, `${DIR}/${jobId}/${stream}.txt`), text, "utf8").catch(() => {});
}

async function refreshCounts(config, jobId, meta) {
  meta.stdoutChars = (await readText(config, `${DIR}/${jobId}/stdout.txt`)).length;
  meta.stderrChars = (await readText(config, `${DIR}/${jobId}/stderr.txt`)).length;
  return meta;
}

async function writeMeta(config, jobId, meta) {
  await fsp.writeFile(safePath(config, `${DIR}/${jobId}/meta.json`), JSON.stringify(meta, null, 2), "utf8");
}

async function readMeta(config, jobId) {
  try { return JSON.parse(await fsp.readFile(safePath(config, `${DIR}/${jobId}/meta.json`), "utf8")); }
  catch (_) { return null; }
}

async function readText(config, rel) {
  try { return await fsp.readFile(safePath(config, rel), "utf8"); }
  catch (_) { return ""; }
}

function killChild(child) { try { child.kill("SIGTERM"); } catch (_) {} }
function allowed(config = {}, payload = {}) { return config.allowCommands === true || payload.allowCommands === true || String(payload.allowCommands).toLowerCase() === "true"; }
function resolveCwd(config, payload) { try { return safePath(config, payload.cwd || payload.path || payload.p || "."); } catch (_) { return config.root || process.cwd(); } }
function boundedTimeout(value) { const n = Number(value || 24 * 60 * 60 * 1000); return Math.max(100, Math.min(Number.isFinite(n) ? n : 120000, 24 * 60 * 60 * 1000)); }
function boundedPageChars(value) { const n = Number(value || DEFAULT_PAGE_CHARS); return Math.max(1000, Math.min(Number.isFinite(n) ? Math.floor(n) : DEFAULT_PAGE_CHARS, MAX_PAGE_CHARS)); }
function defaultShell() { return os.platform() === "win32" ? process.env.ComSpec || "cmd.exe" : "/bin/sh"; }
function cleanId(value) { return String(value || "").replace(/[^a-zA-Z0-9_-]/g, ""); }

module.exports = { startCommandJob, commandStatus, commandWait, commandJobOutputPage, cancelCommandJob };
