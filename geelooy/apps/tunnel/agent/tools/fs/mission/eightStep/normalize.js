// B"H
const { COUNT, STATUS, DEFAULT_THEMES } = require('./config.js');
function text(v) { return String(v || '').trim(); }
function list(v) { if (Array.isArray(v)) return v.map(text).filter(Boolean); if (typeof v === 'string' && v.trim()) { try { const p = JSON.parse(v); if (Array.isArray(p)) return list(p); } catch {} return v.split(/\r?\n|,/).map(text).filter(Boolean); } return []; }
function title(input, index) { return text(input[`step${index + 1}`]) || text(input.title) || `Step ${index + 1}: ${DEFAULT_THEMES[index] || 'continue'}`; }
function step(input, index) { return { id: `step_${Date.now().toString(36)}_${index + 1}`, index, title: title(input, index), status: STATUS.pending, evidence: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }; }
function steps(input = {}) { const provided = list(input.steps || input.next8Steps); return Array.from({ length: COUNT }, (_, i) => provided[i] ? { ...step(input, i), title: provided[i] } : step(input, i)); }
module.exports = { list, steps };
