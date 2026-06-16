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
  const meta = { BH: "B\"H", jobId, action: "commandStart", command, cwd, shell, startedAt: new Date().toISOString(), status: "running", exitCode: null, signal: null, timedOut: false, stdoutChars: 0, stderrChars: 0, timeoutMs };
  await writeMeta(config, jobId, meta);
  const child = childProcess.spawn(command, { cwd, shell, windowsHide: true, detached: false });
  const timer = setTimeout(() => { meta.timedOut = true; try { child.kill("SIGTERM"); } catch (_) {} }, timeoutMs);
  JOBS.set(jobId, { child, meta });
  child.stdout.on("data", chunk => append(config, jobId, "stdout", chunk));
  child.stderr.on("data", chunk => append(config, jobId, "stderr", chunk));
  child.on("error", async error => { clearTimeout(timer); meta.status = "failed"; meta.error = error.message; meta.finishedAt = new Date().toISOString(); await writeMeta(config, jobId, meta); JOBS.delete(jobId); });
  child.on("close", async (code, signal) => { clearTimeout(timer); meta.exitCode = code; meta.signal = signal; meta.status = code === 0 ? "completed" : meta.timedOut ? "timed_out" : "failed"; meta.finishedAt = new Date().toISOString(); await refreshCounts(config, jobId, meta); await writeMeta(config, jobId, meta); JOBS.delete(jobId); });
  return { ok: true, action: "commandStart", jobId, status: "running", command, cwd, shell, timeoutMs, statusPayload: { action: "commandStatus", jobId }, stdoutPagePayload: { action: "commandJobOutputPage", jobId, stream: "stdout", offsetChars: 0, maxChars: DEFAULT_PAGE_CHARS }, stderrPagePayload: { action: "commandJobOutputPage", jobId, stream: "stderr", offsetChars: 0, maxChars: DEFAULT_PAGE_CHARS }, aiInstructions: "Command is running asynchronously. Poll commandStatus and page output with commandJobOutputPage." };
}
async function commandStatus(config = {}, payload = {}) {
  const jobId = cleanId(payload.jobId || payload.id || "");
  if (!jobId) return { ok: false, action: "commandStatus", error: "missing_jobId" };
  const meta = await readMeta(config, jobId);
  if (!meta) return { ok: false, action: "commandStatus", error: "job_not_found_or_expired", jobId };
  await refreshCounts(config, jobId, meta); await writeMeta(config, jobId, meta);
  return { ok: true, action: "commandStatus", ...meta, running: meta.status === "running", stdoutPagePayload: { action: "commandJobOutputPage", jobId, stream: "stdout", offsetChars: Math.max(0, Number(payload.stdoutOffsetChars || 0)), maxChars: boundedPageChars(payload.maxChars || DEFAULT_PAGE_CHARS) }, stderrPagePayload: { action: "commandJobOutputPage", jobId, stream: "stderr", offsetChars: Math.max(0, Number(payload.stderrOffsetChars || 0)), maxChars: boundedPageChars(payload.maxChars || DEFAULT_PAGE_CHARS) } };
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
  return { BH: "B\"H", ok: true, action: "commandJobOutputPage", jobId, stream, status: meta.status, offsetChars: offset, returnedChars: content.length, totalChars: text.length, content, hasNextPage: nextOffsetChars !== null, nextOffsetChars, nextPagePayload: nextOffsetChars === null ? null : { action: "commandJobOutputPage", jobId, stream, offsetChars: nextOffsetChars, maxChars } };
}
async function cancelCommandJob(config = {}, payload = {}) { const jobId = cleanId(payload.jobId || payload.id || ""); const live = JOBS.get(jobId); if (live) { try { live.child.kill("SIGTERM"); } catch (_) {} live.meta.status = "cancelled"; live.meta.finishedAt = new Date().toISOString(); await writeMeta(config, jobId, live.meta); JOBS.delete(jobId); return { ok: true, action: "commandCancel", jobId, cancelled: true }; } return { ok: true, action: "commandCancel", jobId, cancelled: false }; }
async function ensure(config) { await fsp.mkdir(safePath(config, DIR), { recursive: true }); await ensureGitignoreHygiene(config, "command-job-store"); await garbageCollect(config); }
async function garbageCollect(config) { const root = safePath(config, DIR); let entries = []; try { entries = await fsp.readdir(root, { withFileTypes: true }); } catch (_) { return; } const now = Date.now(); for (const entry of entries) { if (!entry.isDirectory()) continue; const stat = await fsp.stat(safePath(config, `${DIR}/${entry.name}/meta.json`)).catch(() => null); if (stat && now - stat.mtimeMs > TTL_MS) await fsp.rm(safePath(config, `${DIR}/${entry.name}`), { recursive: true, force: true }).catch(() => {}); } }
async function append(config, jobId, stream, chunk) { const live = JOBS.get(jobId); const text = Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk || ""); if (live) live.meta[`${stream}Chars`] = Number(live.meta[`${stream}Chars`] || 0) + text.length; await fsp.appendFile(safePath(config, `${DIR}/${jobId}/${stream}.txt`), text, "utf8").catch(() => {}); }
async function refreshCounts(config, jobId, meta) { meta.stdoutChars = (await readText(config, `${DIR}/${jobId}/stdout.txt`)).length; meta.stderrChars = (await readText(config, `${DIR}/${jobId}/stderr.txt`)).length; }
async function writeMeta(config, jobId, meta) { await fsp.writeFile(safePath(config, `${DIR}/${jobId}/meta.json`), JSON.stringify(meta, null, 2), "utf8"); }
async function readMeta(config, jobId) { try { return JSON.parse(await fsp.readFile(safePath(config, `${DIR}/${jobId}/meta.json`), "utf8")); } catch (_) { return null; } }
async function readText(config, rel) { try { return await fsp.readFile(safePath(config, rel), "utf8"); } catch (_) { return ""; } }
function allowed(config = {}, payload = {}) { return config.allowCommands === true || payload.allowCommands === true || String(payload.allowCommands).toLowerCase() === "true"; }
function resolveCwd(config, payload) { try { return safePath(config, payload.cwd || payload.path || payload.p || "."); } catch (_) { return config.root || process.cwd(); } }
function boundedTimeout(value) { const n = Number(value || 24 * 60 * 60 * 1000); return Math.max(100, Math.min(Number.isFinite(n) ? n : 120000, 24 * 60 * 60 * 1000)); }
function boundedPageChars(value) { const n = Number(value || DEFAULT_PAGE_CHARS); return Math.max(1000, Math.min(Number.isFinite(n) ? Math.floor(n) : DEFAULT_PAGE_CHARS, MAX_PAGE_CHARS)); }
function defaultShell() { return os.platform() === "win32" ? process.env.ComSpec || "cmd.exe" : "/bin/sh"; }
function cleanId(value) { return String(value || "").replace(/[^a-zA-Z0-9_-]/g, ""); }
module.exports = { startCommandJob, commandStatus, commandJobOutputPage, cancelCommandJob };
