// B"H
const childProcess = require("child_process");
const os = require("os");
const { safePath } = require("../pathGuard.js");
function buildCommandActions(ctx) { const { config, payload } = ctx; return { async command() { return await runCommand(config, payload, "command"); }, async commandRun() { return await runCommand(config, payload, "commandRun"); }, async shellCommand() { return await runCommand(config, payload, "shellCommand"); } }; }
async function runCommand(config, payload = {}, action = "command") {
  if (!allowed(config, payload)) return { ok:false, action, error:"commands_disabled", message:"Set allowCommands=true in config or payload for explicit command diagnostics." };
  const command = String(payload.command || payload.script || payload.text || "").trim(); if (!command) return { ok:false, action, error:"missing_command" };
  const cwd = resolveCwd(config, payload), timeoutMs = boundedTimeout(payload.timeoutMs || 120000), shell = payload.shell || defaultShell(), startedAt = Date.now();
  return await new Promise(resolve => childProcess.exec(command, { cwd, shell, timeout:timeoutMs, windowsHide:true, maxBuffer:maxBuffer(payload) }, (error, stdout, stderr) => resolve({ ok:!error, action, command, shell, cwd, exitCode:error && Number.isFinite(error.code) ? error.code : 0, signal:error?.signal || null, timedOut:!!(error && error.killed), durationMs:Date.now() - startedAt, timeoutMs, stdout:String(stdout || ""), stderr:String(stderr || ""), error:error ? error.message : null })));
}
function allowed(config = {}, payload = {}) { return config.allowCommands === true || payload.allowCommands === true || String(payload.allowCommands).toLowerCase() === "true"; }
function resolveCwd(config, payload) { const requested = payload.cwd || payload.path || payload.p || "."; try { return safePath(config, requested); } catch { return config.root || process.cwd(); } }
function maxBuffer(payload = {}) { const n = Number(payload.maxBytes || payload.maxText || payload.maxChars || 2 * 1024 * 1024); const max = Number(process.env.AWTSMOOS_COMMAND_MAX_BUFFER_BYTES || 64 * 1024 * 1024); return Math.max(64 * 1024, Math.min(Number.isFinite(n) ? n : 2 * 1024 * 1024, max)); }
function boundedTimeout(value) { const max = Number(process.env.AWTSMOOS_COMMAND_MAX_TIMEOUT_MS || 24 * 60 * 60 * 1000), n = Number(value || 120000); return Math.max(100, Math.min(Number.isFinite(n) ? n : 120000, Number.isFinite(max) ? max : 24 * 60 * 60 * 1000)); }
function defaultShell() { return os.platform() === "win32" ? process.env.ComSpec || "cmd.exe" : "/bin/sh"; }
module.exports = { buildCommandActions, runCommand, boundedTimeout };
