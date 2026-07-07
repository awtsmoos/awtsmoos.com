// B"H
const crypto = require('crypto');
const { spawnAsyncTask } = require('../../../lib/runtime/async-task-process.js');
const Identity = require('../../../lib/runtime/processIdentity.js');

const TASKS = new Map();
const DEFAULT_SAFE_WAIT_MS = 750;
const MAX_SAFE_WAIT_MS = 1500;

/**
 * B"H
 * Chapter 1903: The task became a bird with its own wings.
 *
 * No agent shall chain another agent to a gateway timeout. Waiting is now a
 * short glance; durable status, output pages, and cancel payloads carry the
 * journey across days without asking HTTP to hold its breath.
 */
function buildAsyncTaskActions(ctx) {
  const { config, payload } = ctx;
  return {
    asyncTaskStart: () => start(config, payload),
    asyncTaskStatus: () => status(payload),
    asyncTaskOutputPage: () => output(payload),
    asyncTaskCancel: () => cancel(payload),
    asyncTaskWait: () => wait(payload)
  };
}
async function start(config = {}, payload = {}) {
  if (!allowed(config, payload)) return { ok:false, action:'asyncTaskStart', error:'commands_disabled' };
  const command = String(payload.command || process.execPath);
  const args = Array.isArray(payload.args) ? payload.args.map(String) : argsFromPayload(payload);
  const identity = payload.processIdentity || Identity.fromPayload(payload);
  const taskId = payload.taskId || `task_${identity.processKey}_${Date.now().toString(36)}_${crypto.randomBytes(4).toString('hex')}`;
  const cwd = payload.cwd || config.root || process.cwd();
  const env = { ...(payload.env || {}), ...Identity.env(identity) };
  const runner = spawnAsyncTask({ command, args, cwd, env, timeoutMs:payload.timeoutMs || 300000, maxOutput:payload.maxOutput || 200000 });
  runner.task.processIdentity = identity;
  TASKS.set(taskId, runner);
  return receipt(taskId, runner.task, 'running');
}
function status(payload = {}) {
  const taskId = id(payload), runner = TASKS.get(taskId);
  if (!runner) return { ok:false, action:'asyncTaskStatus', error:'task_not_found', taskId };
  return receipt(taskId, runner.task, runner.task.status);
}
function output(payload = {}) {
  const taskId = id(payload), runner = TASKS.get(taskId);
  if (!runner) return { ok:false, action:'asyncTaskOutputPage', error:'task_not_found', taskId };
  const stream = payload.stream === 'stderr' ? 'stderr' : 'stdout';
  const text = String(runner.task[stream] || '');
  const offset = Math.max(0, Number(payload.offsetChars || 0));
  const max = Math.max(1, Math.min(200000, Number(payload.maxChars || 12000)));
  const content = text.slice(offset, offset + max);
  const next = offset + content.length;
  return { ok:true, action:'asyncTaskOutputPage', taskId, stream, status:runner.task.status, processIdentity:runner.task.processIdentity || null, offsetChars:offset, returnedChars:content.length, totalChars:text.length, content, hasNextPage:next < text.length, nextOffsetChars:next < text.length ? next : null, nextPagePayload:next < text.length ? { action:'asyncTaskOutputPage', taskId, stream, offsetChars:next, maxChars:max } : null };
}
function cancel(payload = {}) {
  const taskId = id(payload), runner = TASKS.get(taskId);
  if (!runner) return { ok:false, action:'asyncTaskCancel', error:'task_not_found', taskId };
  runner.cancel('cancelled');
  return receipt(taskId, runner.task, 'cancelled');
}
async function wait(payload = {}) {
  const taskId = id(payload), runner = TASKS.get(taskId);
  if (!runner) return { ok:false, action:'asyncTaskWait', error:'task_not_found', taskId };
  const started = Date.now();
  const until = started + safeWaitMs(payload);
  while (Date.now() < until && runner.task.status === 'running') await sleep(Math.max(25, Math.min(Number(payload.pollIntervalMs || 100), 250)));
  const base = receipt(taskId, runner.task, runner.task.status);
  return { ...base, waitedMs:Date.now() - started, done:runner.task.status !== 'running', stdout:runner.task.status === 'running' ? null : output({ taskId, stream:'stdout', maxChars:payload.maxChars || 12000 }), stderr:runner.task.status === 'running' ? null : output({ taskId, stream:'stderr', maxChars:payload.maxChars || 12000 }) };
}
function receipt(taskId, task, status) {
  const processIdentity = task.processIdentity || null;
  return { ok:true, action:'asyncTaskStatus', taskId, status, pid:task.pid, processIdentity, osLinks:processIdentity ? Identity.osLinks(processIdentity) : null, startedAt:task.startedAt, finishedAt:task.finishedAt || null, exitCode:task.exitCode, signal:task.signal, statusPayload:{ action:'asyncTaskStatus', taskId }, waitPayload:{ action:'asyncTaskWait', taskId, waitTimeoutMs:DEFAULT_SAFE_WAIT_MS, pollIntervalMs:100 }, stdoutPagePayload:{ action:'asyncTaskOutputPage', taskId, stream:'stdout', offsetChars:0, maxChars:12000 }, stderrPagePayload:{ action:'asyncTaskOutputPage', taskId, stream:'stderr', offsetChars:0, maxChars:12000 }, cancelPayload:{ action:'asyncTaskCancel', taskId } };
}
function safeWaitMs(payload = {}) {
  const n = Number(payload.waitTimeoutMs || payload.timeoutMs || DEFAULT_SAFE_WAIT_MS);
  return Math.max(25, Math.min(Number.isFinite(n) ? Math.floor(n) : DEFAULT_SAFE_WAIT_MS, MAX_SAFE_WAIT_MS));
}
function argsFromPayload(payload = {}) { return payload.script ? ['-e', String(payload.script)] : []; }
function id(payload = {}) { return String(payload.taskId || payload.id || ''); }
function truthy(v) { return v === true || v === 1 || ['true','1','yes'].includes(String(v).toLowerCase()); }
function allowed(config = {}, payload = {}) { return config.allowCommands === true || truthy(payload.allowCommands); }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
module.exports = { TASKS, buildAsyncTaskActions, start, status, output, cancel, wait, safeWaitMs };
