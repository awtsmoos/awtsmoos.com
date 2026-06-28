// B"H
const { COUNT, STATUS } = require('./config.js');
function text(v) { return String(v || '').trim(); }
function list(v) {
  if (Array.isArray(v)) return v.map(text).filter(Boolean);
  if (typeof v === 'string' && v.trim()) {
    try { const p = JSON.parse(v); if (Array.isArray(p)) return list(p); } catch {}
    return v.split(/\r?\n|,/).map(text).filter(Boolean);
  }
  return [];
}
function kind(title = '') {
  const t = text(title).toLowerCase();
  if (/rewrite|write|modify|edit|patch|implement|fix/.test(t)) return 'write';
  if (/test|verify|check|run/.test(t)) return 'verify';
  if (/read|inspect|grep|find|trace|map/.test(t)) return 'read';
  if (/review|diff|compare/.test(t)) return 'review';
  if (/debt|remaining/.test(t)) return 'debt';
  return /plan|brainstorm/.test(t) ? 'plan' : 'work';
}
function fromWorkItem(item = {}, index = 0) {
  return {
    id: `step_${Date.now().toString(36)}_${index + 1}`,
    index,
    title: item.title || `Work item ${index + 1}`,
    kind: item.kind || kind(item.title),
    workKey: item.key || '',
    liveAction: item.payload || null,
    status: STATUS.pending,
    evidence: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
function stepFromTitle(input, title, index) { return fromWorkItem({ title, kind: kind(title), payload: {} }, index); }
function steps(input = {}, workItems = []) {
  const provided = list(input.steps || input.next8Steps);
  const source = provided.length ? provided.map((title, i) => stepFromTitle(input, title, i)) : workItems.slice(0, COUNT).map(fromWorkItem);
  while (source.length < COUNT) source.push(stepFromTitle(input, `Continue concrete file work ${source.length + 1}`, source.length));
  return source.slice(0, COUNT).map((s, index) => ({ ...s, index }));
}
module.exports = { list, steps, kind, fromWorkItem };
