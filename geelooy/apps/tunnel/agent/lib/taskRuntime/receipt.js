// B"H
function receipt(task = {}) { return { ok:task.state !== 'failed', action:'taskReceipt', taskId:task.id, state:task.state, status:task.state, running:['received','validated','scheduled','running'].includes(task.state), done:['completed','failed','cancelled'].includes(task.state), progress:task.progress, result:task.result, error:task.error || '', resume:{ action:'taskStatus', taskId:task.id }, outputPage:{ action:'taskOutputPage', taskId:task.id, stream:'stdout', offsetChars:0, maxChars:12000 }, evidence:(task.stages || []).slice(-5) }; }
module.exports = { receipt };
