// B"H
const Runtime = require('./index.js');
function fromCommandStart(base, commandResult = {}, input = {}) {
  const receipt = Runtime.start(base, 'commandStart', { command:input.command || commandResult.command || '', cwd:input.cwd || commandResult.cwd || '' });
  Runtime.Task.transition(base, receipt.taskId, 'running', { jobId:commandResult.jobId || '' });
  Runtime.Task.progress(base, receipt.taskId, { current:0, total:1, label:'subprocess_running' });
  const task = Runtime.Task.get(base, receipt.taskId);
  task.result = { jobId:commandResult.jobId, statusPayload:commandResult.statusPayload, waitPayload:commandResult.waitPayload, stdoutPagePayload:commandResult.stdoutPagePayload };
  Runtime.Store.patch(base, state => { state.tasks[receipt.taskId] = task; return state; });
  return Runtime.Receipt.receipt(Runtime.Task.get(base, receipt.taskId));
}
function completeFromWait(base, taskId, waitResult = {}) {
  if (waitResult.status === 'completed' || waitResult.done === true) return Runtime.Task.complete(base, taskId, waitResult);
  if (waitResult.ok === false) return Runtime.Task.fail(base, taskId, waitResult.error || 'command_failed');
  Runtime.Task.progress(base, taskId, { label:waitResult.status || 'running' });
  return Runtime.Task.get(base, taskId);
}
module.exports = { fromCommandStart, completeFromWait };
