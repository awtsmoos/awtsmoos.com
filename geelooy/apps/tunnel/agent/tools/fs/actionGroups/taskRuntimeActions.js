// B"H
const Runtime = require('../../../lib/taskRuntime/index.js');
function baseFrom(config = {}) { return config.root || process.env.HOME || process.cwd(); }
function taskId(payload = {}) { return payload.taskId || payload.id || payload.tid || ''; }
function asAction(action, receipt = {}) { return { ...receipt, action, requestAction:action, actualAction:action, receiptAction:receipt.action || 'taskReceipt' }; }
function buildTaskRuntimeActions(ctx = {}) {
  const { config, payload } = ctx;
  const base = baseFrom(config);
  return {
    taskStart: async () => asAction('taskStart', Runtime.start(base, payload.taskAction || payload.kind || payload.name || 'manualTask', payload)),
    taskStatus: async () => asAction('taskStatus', Runtime.status(base, taskId(payload))),
    taskOutputPage: async () => ({ ...Runtime.Output.page(base, taskId(payload), payload.stream || 'stdout', payload.offsetChars || 0, payload.maxChars || 12000), action:'taskOutputPage', requestAction:'taskOutputPage', actualAction:'taskOutputPage' }),
    taskComplete: async () => asAction('taskComplete', Runtime.Receipt.receipt(Runtime.Task.complete(base, taskId(payload), payload.result || { ok:true }))),
    taskFail: async () => asAction('taskFail', Runtime.Receipt.receipt(Runtime.Task.fail(base, taskId(payload), payload.error || 'failed'))),
    taskAppendOutput: async () => asAction('taskAppendOutput', Runtime.Receipt.receipt(Runtime.Output.append(base, taskId(payload), payload.stream || 'stdout', payload.content || payload.text || '')))
  };
}
module.exports = { buildTaskRuntimeActions, taskId, baseFrom, asAction };
