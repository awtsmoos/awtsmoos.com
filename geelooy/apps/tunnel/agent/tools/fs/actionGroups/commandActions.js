// B"H
const childProcess = require("child_process");
const os = require("os");
const path = require("path");
const { safePath } = require("../pathGuard.js");

/**
 * B"H
 * Chapter 410: The command gate was named plainly.
 * Installed agents now expose `command` as a guarded alias for explicit shell
 * diagnostics. It refuses to run unless allowCommands is enabled in config or
 * in the current payload, and it reports exact stdout/stderr without magic.
 */
function buildCommandActions(ctx) {
  const { config, payload } = ctx;
  return {
    async command() { return await runCommand(config, payload, "command"); },
    async commandRun() { return await runCommand(config, payload, "commandRun"); },
    async shellCommand() { return await runCommand(config, payload, "shellCommand"); }
  };
}

async function runCommand(config, payload = {}, action = "command") {
  if (!allowed(config, payload)) return { ok: false, action, error: "commands_disabled", message: "Set allowCommands=true in config or payload for explicit command diagnostics." };
  const command = String(payload.command || payload.script || payload.text || "").trim();
  if (!command) return { ok: false, action, error: "missing_command" };
  const cwd = resolveCwd(config, payload);
  const timeoutMs = Math.max(100, Math.min(Number(payload.timeoutMs || 120000), 600000));
  const shell = payload.shell || defaultShell();
  const startedAt = Date.now();
  return await new Promise(resolve => {
    childProcess.exec(command, { cwd, shell, timeout: timeoutMs, windowsHide: true, maxBuffer: maxBuffer(payload) }, (error, stdout, stderr) => {
      resolve({
        ok: !error,
        action,
        command,
        shell,
        cwd,
        exitCode: error && Number.isFinite(error.code) ? error.code : 0,
        signal: error && error.signal ? error.signal : null,
        timedOut: !!(error && error.killed),
        durationMs: Date.now() - startedAt,
        stdout: String(stdout || ""),
        stderr: String(stderr || ""),
        error: error ? error.message : null
      });
    });
  });
}

function allowed(config = {}, payload = {}) {
  return config.allowCommands === true || payload.allowCommands === true || String(payload.allowCommands).toLowerCase() === "true";
}

function resolveCwd(config, payload) {
  const requested = payload.cwd || payload.path || payload.p || ".";
  try { return safePath(config, requested); }
  catch { return config.root || process.cwd(); }
}

function maxBuffer(payload = {}) {
  const n = Number(payload.maxBytes || payload.maxText || 2 * 1024 * 1024);
  return Math.max(64 * 1024, Math.min(Number.isFinite(n) ? n : 2 * 1024 * 1024, 16 * 1024 * 1024));
}

function defaultShell() { return os.platform() === "win32" ? process.env.ComSpec || "cmd.exe" : "/bin/sh"; }

module.exports = { buildCommandActions, runCommand };
