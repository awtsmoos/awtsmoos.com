// B"H
const C = require('./constants.js');
const { now } = require('./id.js');
function empty() { return { version:1, updatedAt:now(), tasks:{}, order:[] }; }
function normalize(state = {}) { return { ...empty(), ...state, tasks:state.tasks || {}, order:Array.isArray(state.order) ? state.order : [] }; }
function task(action = 'unknown', input = {}) { return { id:input.id || '', action, state:'received', createdAt:now(), updatedAt:now(), stages:[], evidence:[], progress:{ current:0, total:0, label:'' }, output:{ stdout:'', stderr:'', pages:{} }, result:null, error:'', input:compactInput(input) }; }
function compactInput(input = {}) { const out = { ...input }; if (typeof out.content === 'string' && out.content.length > 500) out.content = `${out.content.slice(0,500)}…`; if (typeof out.command === 'string' && out.command.length > 500) out.command = `${out.command.slice(0,500)}…`; return out; }
function trim(state) { const ids = state.order.slice(-C.MAX_TASKS); const keep = new Set(ids); for (const id of Object.keys(state.tasks)) if (!keep.has(id)) delete state.tasks[id]; state.order = ids; return state; }
module.exports = { empty, normalize, task, compactInput, trim };
