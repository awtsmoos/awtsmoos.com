// B"H
const childProcess = require("child_process");
const os = require("os");
const { safePath } = require("../pathGuard.js");
const { saveCommandOutput, readCommandOutputPage } = require("../commandOutputStore.js");
const { startCommandJob, commandStatus, commandJobOutputPage, cancelCommandJob } = require("../commandJobStore.js");

/**
 * B"H
 * Chapter: The command runner learned to page its thunder and stream its rivers.
 */
function buildCommandActions(ctx) {
  const { config, payload } = ctx;
  return {
    async command() { return isAsync(payload) ? await startCommandJob(config, payload) : await runCommand(config, payload, "command"); },
    async commandRun() { return isAsync(payload) ? await startCommandJob(config, payload) : await runCommand(config, payload, "commandRun"); },
    async shellCommand() { return isAsync(payload) ? await startCommandJob(config, payload) : await runCommand(config, payload, "shellCommand"); },
    async commandStart() { return await startCommandJob(config, payload); },
    async commandStatus() { return await commandStatus(config, payload); },
    async commandPoll() { return await commandStatus(config, payload); },
    async commandCancel() { return await cancelCommandJob(config, payload); },
    async commandJobStatus() { return await commandStatus(config, payload); },
    async commandJobCancel() { return await cancelCommandJob(config, payload); },
    async commandJobOutputPage() { return await commandJobOutputPage(config, payload); },
    async commandOutputPage() { return await readCommandOutputPage(config, payload); }
  };
}

async function runCommand(config, payload = {}, action = "command") {
  if (!allowed(config, payload)) return { ok: false, action, error: "commands_disabled", message: "Set allowCommands=true in config or payload for explicit command diagnostics." };
  const command = String(payload.command || payload.script || payload.text || "").trim();
  if (!command) return { ok: false, action, error: "missing_command" };
  const cwd = resolveCwd(config, payload);
  const timeoutMs = boundedTimeout(payload.timeoutMs || 120000);
  const shell = payload.shell || defaultShell();
  const startedAt = Date.now();
  const raw = await new Promise(resolve => childProcess.exec(command, { cwd, shell, timeout: timeoutMs, windowsHide: true, maxBuffer: maxBuffer(payload) }, (error, stdout, stderr) => resolve({
    ok: !error,
    action,
    command,
    shell,
    cwd,
    exitCode: error && Number.isFinite(error.code) ? error.code : 0,
    signal: error?.signal || null,
    timedOut: !!(error && error.killed),
    durationMs: Date.now() - startedAt,
    timeoutMs,
    stdout: String(stdout || ""),
    stderr: String(stderr || ""),
    error: error ? error.message : null
  })));
  return await saveCommandOutput(config, payload, raw);
}

function isAsync(payload = {}) {
  return payload.async === true || payload.asyncCommand === true || payload.background === true || payload.stream === true || String(payload.async || payload.asyncCommand || payload.background || "").toLowerCase() === "true";
}
function allowed(config = {}, payload = {}) { return config.allowCommands === true || payload.allowCommands === true || String(payload.allowCommands).toLowerCase() === "true"; }
function resolveCwd(config, payload) { try { return safePath(config, payload.cwd || payload.path || payload.p || "."); } catch (_) { return config.root || process.cwd(); } }
function maxBuffer(payload = {}) { const n = Number(payload.maxBytes || payload.maxText || payload.maxBufferBytes || 64 * 1024 * 1024); const max = Number(process.env.AWTSMOOS_COMMAND_MAX_BUFFER_BYTES || 256 * 1024 * 1024); return Math.max(64 * 1024, Math.min(Number.isFinite(n) ? n : 64 * 1024 * 1024, max)); }
function boundedTimeout(value) { const max = Number(process.env.AWTSMOOS_COMMAND_MAX_TIMEOUT_MS || 24 * 60 * 60 * 1000); const n = Number(value || 120000); return Math.max(100, Math.min(Number.isFinite(n) ? n : 120000, Number.isFinite(max) ? max : 24 * 60 * 60 * 1000)); }
function defaultShell() { return os.platform() === "win32" ? process.env.ComSpec || "cmd.exe" : "/bin/sh"; }

module.exports = { buildCommandActions, runCommand, boundedTimeout, isAsync };
