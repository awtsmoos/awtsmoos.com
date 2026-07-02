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
 * The command gate must be two things at once: a truthful machine and a faithful
 * messenger. Canonical workers may do the labor, but the name spoken back to an
 * agent must remain the name the agent invoked, so correlation never mistakes a
 * living receipt for a stranger wearing another action's garment.
 */
function buildCommandActions(ctx) {
  const { config, payload } = ctx;
  return {
    command: () => runSmart(config, payload, 'command'),
    commandRun: () => runSmart(config, payload, 'commandRun'),
    shellCommand: () => runSmart(config, payload, 'shellCommand'),
    commandStart: () => startCommandJob(config, payload),
    commandStatus: () => commandStatus(config, payload),
    commandPoll: () => runAlias(config, payload, 'commandPoll', 'commandStatus', commandStatus),
    commandWait: () => commandWait(config, payload),
    commandCancel: () => cancelCommandJob(config, payload),
    commandJobStatus: () => runAlias(config, payload, 'commandJobStatus', 'commandStatus', commandStatus),
    commandJobWait: () => runAlias(config, payload, 'commandJobWait', 'commandWait', commandWait),
    commandJobCancel: () => runAlias(config, payload, 'commandJobCancel', 'commandCancel', cancelCommandJob),
    commandJobOutputPage: () => commandJobOutputPage(config, payload),
    commandOutputPage: () => readAnyCommandOutputPage(config, payload),
  };
}

async function runAlias(config, payload, requestedAction, canonicalAction, fn) {
  const result = await fn(config, { ...payload, action: canonicalAction, actualAction: canonicalAction, requestAction: requestedAction });
  return preserveAliasIdentity(result, requestedAction, canonicalAction);
}
async function readAnyCommandOutputPage(config, payload = {}) {
  if (payload.outputId || String(payload.outputRef || '').startsWith('device://')) return await readCommandOutputPage(config, payload);
  return await runAlias(config, payload, 'commandOutputPage', 'commandJobOutputPage', commandJobOutputPage);
}

function preserveAliasIdentity(result, requestedAction, canonicalAction) {
  const out = result && typeof result === 'object' ? { ...result } : { ok: false, error: 'empty_action_response' };
  return { ...out, action: requestedAction, requestAction: requestedAction, actualAction: requestedAction, canonicalAction, servedByAction: canonicalAction };
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

module.exports = { buildCommandActions, runCommand, boundedTimeout, isAsync, shouldRunSync, preserveAliasIdentity };
