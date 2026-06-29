// B"H
const PHASES = ['discover','analyze','plan','execute','verify','measure','expand','release'];
const STATUSES = ['discovered','analyzed','planned','ready','executing','verifying','complete','blocked','superseded','failed'];
const TYPES = ['file_read','file_rewrite','command','test','browser_check','verification','review','release_decision','documentation','handoff'];
function includes(list, value, fallback) { return list.includes(value) ? value : fallback; }
function phase(value) { return includes(PHASES, value, 'discover'); }
function status(value) { return includes(STATUSES, value, 'discovered'); }
function type(value) { return includes(TYPES, value, 'verification'); }
function now() { return new Date().toISOString(); }
module.exports = { PHASES, STATUSES, TYPES, phase, status, type, now };
