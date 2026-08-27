// B"H
const Store = require('./store.js');
const State = require('./state.js');
const C = require('./constants.js');
const { make, now } = require('./id.js');
function create(base, action, input = {}) { const id = input.id || make('task'); let created; Store.patch(base, state => { created = { ...State.task(action, { ...input, id }), id }; state.tasks[id] = created; state.order.push(id); return state; }); return created; }
function transition(base, id, stateName, evidence = {}) { if (!C.STATES.includes(stateName)) throw new Error(`invalid_task_state:${stateName}`); let task; Store.patch(base, state => { task = state.tasks[id]; if (!task) throw new Error(`missing_task:${id}`); task.state = stateName; task.updatedAt = now(); task.stages.push({ state:stateName, at:task.updatedAt, evidence }); task.stages = task.stages.slice(-C.MAX_EVENTS); return state; }); return task; }
function progress(base, id, patch = {}) { let task; Store.patch(base, state => { task = state.tasks[id]; if (!task) throw new Error(`missing_task:${id}`); task.progress = { ...(task.progress || {}), ...patch, at:now() }; task.updatedAt = now(); return state; }); return task; }
function complete(base, id, result = {}) { let task; Store.patch(base, state => { task = state.tasks[id]; if (!task) throw new Error(`missing_task:${id}`); task.state = 'completed'; task.result = result; task.updatedAt = now(); task.stages.push({ state:'completed', at:task.updatedAt, evidence:{ ok:true } }); return state; }); return task; }
function fail(base, id, error) { let task; Store.patch(base, state => { task = state.tasks[id]; if (!task) throw new Error(`missing_task:${id}`); task.state = 'failed'; task.error = String(error?.message || error || 'failed'); task.updatedAt = now(); task.stages.push({ state:'failed', at:task.updatedAt, evidence:{ error:task.error } }); return state; }); return task; }
function get(base, id) { return Store.read(base).tasks[id] || null; }
module.exports = { create, transition, progress, complete, fail, get };
