// B"H
const Store = require('./store.js');
const Task = require('./task.js');
const Output = require('./output.js');
const Receipt = require('./receipt.js');
function start(base, action, input = {}) { const task = Task.create(base, action, input); Task.transition(base, task.id, 'validated', { input:true }); Task.transition(base, task.id, 'scheduled', { queued:true }); return Receipt.receipt(Task.get(base, task.id)); }
function status(base, taskId) { const task = Task.get(base, taskId); return task ? Receipt.receipt(task) : { ok:false, action:'taskStatus', error:'missing_task', taskId }; }
module.exports = { Store, Task, Output, Receipt, start, status };
