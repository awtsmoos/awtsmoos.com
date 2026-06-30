// B"H
const crypto = require('crypto');
const { spawnAsyncTask } = require('../../../lib/runtime/async-task-process.js');

/**
 * B"H
 * Chapter 1903: The task became a bird with its own wings.
 *
 * These actions give any future heavy feature a common subprocess receipt:
 * start fast, stream bounded output, cancel the process group, and let the
 * tunnel kernel remain only the watcher at the window.
 */
const TASKS = new Map();
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
  const taskId = payload.taskId || `task_${Date.now().toString(36)}_${crypto.randomBytes(6).toString('hex')}`;
  const cwd = payload.cwd || config.root || process.cwd();
  const runner = spawnAsyncTask({ command, args, cwd, env:payload.env || {}, timeoutMs:payload.timeoutMs || 300000, maxOutput:payload.maxOutput || 200000 });
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
  return { ok:true, action:'asyncTaskOutputPage', taskId, stream, status:runner.task.status, offsetChars:offset, returnedChars:content.length, totalChars:text.length, content, hasNextPage:next < text.length, nextOffsetChars:next < text.length ? next : null, nextPagePayload:next < text.length ? { action:'asyncTaskOutputPage', taskId, stream, offsetChars:next, maxChars:max } : null };
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
  const until = Date.now() + Math.min(Number(payload.waitTimeoutMs || 25000), 60000);
  while (Date.now() < until && runner.task.status === 'running') await new Promise(r => setTimeout(r, Math.max(50, Number(payload.pollIntervalMs || 250))));
  return { ...receipt(taskId, runner.task, runner.task.status), stdout:output({ taskId, stream:'stdout', maxChars:payload.maxChars || 12000 }), stderr:output({ taskId, stream:'stderr', maxChars:payload.maxChars || 12000 }) };
}
function receipt(taskId, task, status) {
  return { ok:true, action:'asyncTaskStatus', taskId, status, pid:task.pid, startedAt:task.startedAt, finishedAt:task.finishedAt || null, exitCode:task.exitCode, signal:task.signal, statusPayload:{ action:'asyncTaskStatus', taskId }, waitPayload:{ action:'asyncTaskWait', taskId, waitTimeoutMs:25000, pollIntervalMs:500 }, stdoutPagePayload:{ action:'asyncTaskOutputPage', taskId, stream:'stdout', offsetChars:0, maxChars:12000 }, stderrPagePayload:{ action:'asyncTaskOutputPage', taskId, stream:'stderr', offsetChars:0, maxChars:12000 }, cancelPayload:{ action:'asyncTaskCancel', taskId } };
}
function argsFromPayload(payload = {}) { return payload.script ? ['-e', String(payload.script)] : []; }
function id(payload = {}) { return String(payload.taskId || payload.id || ''); }
function truthy(v) { return v === true || v === 1 || ['true','1','yes'].includes(String(v).toLowerCase()); }
function allowed(config = {}, payload = {}) { return config.allowCommands === true || truthy(payload.allowCommands); }
module.exports = { TASKS, buildAsyncTaskActions, start, status, output, cancel, wait };
