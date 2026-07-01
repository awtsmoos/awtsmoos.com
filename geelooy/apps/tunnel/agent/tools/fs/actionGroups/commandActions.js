// B"H
const childProcess = require('child_process');
const os = require('os');
const { safePath } = require('../pathGuard.js');
const { saveCommandOutput, readCommandOutputPage } = require('../commandOutputStore.js');
const {
  startCommandJob,
  commandStatus,
  commandWait,
  commandJobOutputPage,
  cancelCommandJob
} = require('../commandJobStore.js');

/**
 * B"H
 * The command river now exposes every resumable stone in one visible ford.
 * Agents who receive a waitPayload must be able to call commandWait through
 * the same buildActions vessel used by tests, mission steps, and replay.
 */
function buildCommandActions(ctx) {
  const { config, payload } = ctx;
  return {
    command: () => runSmart(config, payload, 'command'),
    commandRun: () => runSmart(config, payload, 'commandRun'),
    shellCommand: () => runSmart(config, payload, 'shellCommand'),
    commandStart: () => startCommandJob(config, payload),
    commandStatus: () => commandStatus(config, payload),
    commandPoll: () => commandStatus(config, payload),
    commandWait: () => commandWait(config, payload),
    commandCancel: () => cancelCommandJob(config, payload),
    commandJobStatus: () => commandStatus(config, payload),
    commandJobWait: () => commandWait(config, payload),
    commandJobCancel: () => cancelCommandJob(config, payload),
    commandJobOutputPage: () => commandJobOutputPage(config, payload),
    commandOutputPage: () => readCommandOutputPage(config, payload)
  };
}

async function runSmart(config, payload = {}, action = 'command') {
  if (shouldRunSync(payload)) return await runCommand(config, payload, action);
  const job = await startCommandJob(config, { ...payload, action: 'commandStart', requestAction: action, actualAction: 'commandStart' });
  const summary = `Started ${action} in isolated subprocess worker.`;
  return { ...job, action, requestAction: action, actualAction: 'commandStart', summary, mode: 'async_job', syncOptIn: 'Set sync:true only for tiny commands.' };
}

async function runCommand(config, payload = {}, action = 'command') {
  if (!allowed(config, payload)) return disabled(action);
  const command = commandText(payload);
  if (!command) return { ok: false, action, error: 'missing_command' };
  const cwd = resolveCwd(config, payload);
  const timeoutMs = boundedTimeout(payload.timeoutMs || 120000);
  const shell = payload.shell || defaultShell();
  const startedAt = Date.now();
  const raw = await execCommand(command, { cwd, shell, timeoutMs, payload, action, startedAt });
  return await saveCommandOutput(config, payload, raw);
}

function execCommand(command, opts) {
  return new Promise(resolve => childProcess.exec(command, {
    cwd: opts.cwd,
    shell: opts.shell,
    timeout: opts.timeoutMs,
    windowsHide: true,
    maxBuffer: maxBuffer(opts.payload)
  }, (error, stdout, stderr) => resolve({
    ok: !error,
    action: opts.action,
    command,
    shell: opts.shell,
    cwd: opts.cwd,
    exitCode: error && Number.isFinite(error.code) ? error.code : 0,
    signal: error?.signal || null,
    timedOut: !!(error && error.killed),
    durationMs: Date.now() - opts.startedAt,
    timeoutMs: opts.timeoutMs,
    stdout: String(stdout || ''),
    stderr: String(stderr || ''),
    error: error ? error.message : null,
    outputStrategy: 'paged_if_large'
  })));
}

function shouldRunSync(payload = {}) { return truthy(payload.sync) || truthy(payload.inline) || truthy(payload.blocking); }
function isAsync(payload = {}) { return !shouldRunSync(payload); }
function commandText(payload = {}) { return String(payload.command || payload.script || payload.text || '').trim(); }
function disabled(action) { return { ok: false, action, error: 'commands_disabled', message: 'Set allowCommands=true in config or payload.' }; }
function truthy(value) { return value === true || value === 1 || ['true', '1', 'yes'].includes(String(value).toLowerCase()); }
function allowed(config = {}, payload = {}) { return config.allowCommands === true || truthy(payload.allowCommands); }
function resolveCwd(config, payload) { try { return safePath(config, payload.cwd || payload.path || payload.p || '.'); } catch (_) { return config.root || process.cwd(); } }
function maxBuffer(payload = {}) {
  const n = Number(payload.maxBytes || payload.maxText || payload.maxBufferBytes || 64 * 1024 * 1024);
  const max = Number(process.env.AWTSMOOS_COMMAND_MAX_BUFFER_BYTES || 256 * 1024 * 1024);
  return Math.max(64 * 1024, Math.min(Number.isFinite(n) ? n : 64 * 1024 * 1024, max));
}
function boundedTimeout(value) {
  const max = Number(process.env.AWTSMOOS_COMMAND_MAX_TIMEOUT_MS || 24 * 60 * 60 * 1000);
  const n = Number(value || 120000);
  return Math.max(100, Math.min(Number.isFinite(n) ? n : 120000, Number.isFinite(max) ? max : 24 * 60 * 60 * 1000));
}
function defaultShell() { return os.platform() === 'win32' ? process.env.ComSpec || 'cmd.exe' : '/bin/sh'; }

module.exports = { buildCommandActions, runCommand, boundedTimeout, isAsync, shouldRunSync };
