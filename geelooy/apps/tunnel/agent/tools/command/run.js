// B"H
const childProcess = require("child_process");
const path = require("path");
const fsp = require("fs/promises");
const crypto = require("crypto");
const { FOUR_MINUTES_MS } = require("../../lib/config.js");
const { shellArgs, fallbackShellArgs } = require("./shells.js");
const { startCommandJob } = require("../fs/commandJobStore.js");

const OUTPUT_DIR = ".awtsmoos/command-output";
const DEFAULT_MAX_OUTPUT_FILES = 200;
const DEFAULT_MAX_OUTPUT_AGE_MS = 12 * 60 * 60 * 1000;

/**
 * B"H
 * Chapter 490: The command river stopped trying to fit the sea into one cup.
 * Normal commandRun now starts an async job and returns immediately; only
 * sync:true / inline:true / blocking:true uses the fragile single-response path.
 */
async function runCommand(config, payload = {}) {
  if (!commandAllowed(config)) return disabled();
  if (!commandText(payload)) return { ok: false, action: "commandRun", error: "missing_command" };
  if (!wantsSync(payload)) return startAsync(config, payload);
  return runInline(config, payload);
}

async function startAsync(config, payload) {
  const requestAction = String(payload.requestAction || payload.requestedAction || payload.action || "commandRun").trim() || "commandRun";
  const job = await startCommandJob(config, {
    ...payload,
    action: "commandStart",
    actualAction: "commandStart",
    requestAction,
    requestedAction: requestAction
  });
  return {
    ...job,
    action: requestAction,
    requestAction,
    requestedAction: requestAction,
    actualAction: "commandStart",
    actionMismatch: requestAction !== "commandStart",
    mode: "async_job",
    syncOptIn: "Set sync:true only for tiny commands."
  };
}

async function runInline(config, payload) {
  const command = commandText(payload);
  const shell = payload.shell || config.command.defaultShell || defaultShellName();
  const cwd = safeCwd(config, payload.cwd || ".");
  const timeoutMs = boundedTimeout(payload.timeoutMs, Math.min(config.command.timeoutMs || FOUR_MINUTES_MS, 30000));
  const maxOutput = maxOutputChars(config, payload);
  const first = await execPicked(config, shellArgs(shell, command), command, cwd, timeoutMs, maxOutput);
  if (first.err && first.err.code === "ENOENT") {
    const second = await execPicked(config, fallbackShellArgs(command), command, cwd, timeoutMs, maxOutput);
    second.response.firstShellError = first.response.error;
    return second.response;
  }
  return first.response;
}

function execPicked(config, picked, command, cwd, timeoutMs, maxOutput) {
  return new Promise(resolve => {
    const startedAt = Date.now();
    const child = childProcess.execFile(picked.file, picked.args, { cwd, windowsHide: true, maxBuffer: maxOutput + 20000 }, done);
    let settled = false;
    const timer = setTimeout(() => killTree(child), timeoutMs);
    async function done(err, stdout, stderr) {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve({ err, response: await responseOf(config, { err, stdout, stderr, picked, command, cwd, timeoutMs, startedAt, maxOutput }) });
    }
  });
}

async function responseOf(config, got) {
  const out = trimOutput(got.stdout, got.maxOutput);
  const er = trimOutput(got.stderr, got.maxOutput);
  const stdoutSpill = out.truncated ? await spillOutput(config, "stdout", got.stdout) : null;
  const stderrSpill = er.truncated ? await spillOutput(config, "stderr", got.stderr) : null;
  const timedOut = Boolean(got.err?.killed || got.err?.signal || /timed out|timeout|SIGTERM|SIGKILL/i.test(got.err?.message || ""));
  return { ok: !got.err, action: "commandRun", command: got.command, shell: got.picked.shell, shellFile: got.picked.file, cwd: got.cwd, exitCode: exitCode(got.err), signal: got.err?.signal || null, durationMs: Date.now() - got.startedAt, timeoutMs: got.timeoutMs, timedOut, stdout: out.text, stderr: er.text, stdoutRef: stdoutSpill?.ref || null, stderrRef: stderrSpill?.ref || null, stdoutBytes: stdoutSpill?.bytes || byteLength(got.stdout), stderrBytes: stderrSpill?.bytes || byteLength(got.stderr), outputRetention: stdoutSpill?.retention || stderrSpill?.retention || null, truncated: out.truncated || er.truncated, guidance: guidance(out, er, timedOut), error: got.err ? got.err.message : null };
}

function killTree(child) { try { child.kill("SIGTERM"); } catch (_) {} setTimeout(() => { try { child.kill("SIGKILL"); } catch (_) {} }, 1500).unref?.(); }
function guidance(out, er, timedOut) { if (out.truncated || er.truncated) return "Read stdoutRef/stderrRef before retention expires."; if (timedOut) return "Command hit inline timeout. Prefer default async job mode or raise timeoutMs."; return null; }
function exitCode(err) { return err && Number.isFinite(err.code) ? err.code : 0; }
function commandAllowed(config = {}) { return Boolean(config.allowCommands && config.tools?.command && config.command?.enabled); }
function disabled() { return { ok: false, action: "commandRun", error: "commands_disabled", message: "Enable commands, then Save Config." }; }
function wantsSync(payload = {}) { return [payload.sync, payload.inline, payload.blocking].some(x => x === true || x === 1 || ["true", "1", "yes"].includes(String(x).toLowerCase())); }
function commandText(payload = {}) { return String(payload.command || payload.script || payload.text || "").trim(); }
function cleanRel(given, root) { let s = String(given || ".").replace(/\\/g, "/").replace(/^\/+/, ""); const rootName = path.basename(root).toLowerCase(); if (s.toLowerCase() === rootName) return "."; if (s.toLowerCase().startsWith(rootName + "/")) s = s.slice(rootName.length + 1); return s || "."; }
function safeCwd(config, given) { const root = path.resolve(config.root); const raw = String(given || ".").trim(); const cwd = path.isAbsolute(raw) ? path.resolve(raw) : path.resolve(root, cleanRel(raw, root)); if (!cwd.toLowerCase().startsWith(root.toLowerCase())) throw new Error("Command cwd outside root is blocked: " + cwd); return cwd; }
function trimOutput(text, max) { text = String(text || ""); return text.length <= max ? { text, truncated: false } : { text: text.slice(0, max), truncated: true }; }
function byteLength(text) { return Buffer.byteLength(String(text || ""), "utf8"); }
function clamp(value, min, max, fallback) { return Number.isFinite(value) ? Math.max(min, Math.min(max, Math.floor(value))) : fallback; }
function outputRetention(config = {}) { const got = config.commandOutputRetention || config.outputRetention || {}; return { maxFiles: clamp(Number(got.maxFiles || process.env.AWTSMOOS_COMMAND_OUTPUT_MAX_FILES || DEFAULT_MAX_OUTPUT_FILES), 5, 5000, DEFAULT_MAX_OUTPUT_FILES), maxAgeMs: clamp(Number(got.maxAgeMs || process.env.AWTSMOOS_COMMAND_OUTPUT_MAX_AGE_MS || DEFAULT_MAX_OUTPUT_AGE_MS), 60000, 7 * 24 * 60 * 60 * 1000, DEFAULT_MAX_OUTPUT_AGE_MS) }; }
async function spillOutput(config, kind, text) { const dir = path.join(config.root, OUTPUT_DIR); await fsp.mkdir(dir, { recursive: true }); await pruneCommandOutput(config); const name = `cmdout_${Date.now().toString(36)}_${crypto.randomBytes(4).toString("hex")}_${kind}.txt`; const rel = `${OUTPUT_DIR}/${name}`; await fsp.writeFile(path.join(config.root, rel), String(text || ""), "utf8"); const cleanup = await pruneCommandOutput(config); return { ref: rel, bytes: byteLength(text), retention: cleanup.summary }; }
async function pruneCommandOutput(config, overrides = {}) { const policy = { ...outputRetention(config), ...overrides }; const dir = path.join(config.root, OUTPUT_DIR); await fsp.mkdir(dir, { recursive: true }); let entries = []; try { entries = await fsp.readdir(dir, { withFileTypes: true }); } catch (_) {} const now = Date.now(); const files = []; for (const entry of entries) { if (!entry.isFile() || !entry.name.startsWith("cmdout_") || !entry.name.endsWith(".txt")) continue; const full = path.join(dir, entry.name); const stat = await fsp.stat(full).catch(() => null); files.push({ full, mtimeMs: stat?.mtimeMs || 0 }); } files.sort((a, b) => b.mtimeMs - a.mtimeMs); let deleted = 0; for (let i = 0; i < files.length; i++) { if (i < policy.maxFiles && now - files[i].mtimeMs <= policy.maxAgeMs) continue; await fsp.unlink(files[i].full).then(() => deleted++).catch(() => {}); } return { ok: true, action: "commandOutputGarbageCollect", policy, beforeFiles: files.length, deleted, afterFiles: Math.max(0, files.length - deleted), summary: { maxFiles: policy.maxFiles, maxAgeMs: policy.maxAgeMs, deleted } }; }
function commandMaxTimeout() { const n = Number(process.env.AWTSMOOS_COMMAND_MAX_TIMEOUT_MS || 24 * 60 * 60 * 1000); return Number.isFinite(n) ? Math.max(FOUR_MINUTES_MS, Math.min(n, 7 * 24 * 60 * 60 * 1000)) : 24 * 60 * 60 * 1000; }
function boundedTimeout(value, fallback = FOUR_MINUTES_MS) { const n = Number(value || fallback || FOUR_MINUTES_MS); return Math.max(1000, Math.min(Number.isFinite(n) ? Math.floor(n) : FOUR_MINUTES_MS, commandMaxTimeout())); }
function maxOutputChars(config, payload) { return Math.max(1000, Math.min(Number(payload.maxChars || config.command.maxOutput || 120000), Number(process.env.AWTSMOOS_COMMAND_MAX_OUTPUT_CHARS || 5000000))); }
function defaultShellName() { return process.platform === "win32" ? "powershell" : "bash"; }

module.exports = { runCommand, safeCwd, boundedTimeout, pruneCommandOutput, outputRetention };
