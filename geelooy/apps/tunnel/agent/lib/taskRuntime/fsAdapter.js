// B"H
const Runtime = require('./index.js');
function fromFsResult(base, action, result = {}, input = {}) {
  const receipt = Runtime.start(base, action, { path:input.p || input.path || result.path || result.absolutePath || '' });
  Runtime.Task.transition(base, receipt.taskId, 'running', { fs:true });
  if (result.ok === false) return Runtime.Receipt.receipt(Runtime.Task.fail(base, receipt.taskId, result.error || 'fs_failed'));
  Runtime.Task.complete(base, receipt.taskId, compact(action, result));
  return Runtime.Receipt.receipt(Runtime.Task.get(base, receipt.taskId));
}
function compact(action, result = {}) {
  if (action === 'read') return { ok:true, action, content:result.content || '', returnedChars:result.returnedChars, totalChars:result.totalChars, absolutePath:result.absolutePath || result.path || '' };
  if (action === 'list' || action === 'tree') return { ok:true, action, items:result.items || result.entries || [], count:result.count || result.items?.length || 0, absolutePath:result.absolutePath || result.root || '' };
  if (action === 'write') return { ok:true, action, absolutePath:result.absolutePath || result.path || '', bytes:result.bytes || result.written || 0, hash:result.hash || result.sha256 || '' };
  return { ...result, action };
}
module.exports = { fromFsResult, compact };
