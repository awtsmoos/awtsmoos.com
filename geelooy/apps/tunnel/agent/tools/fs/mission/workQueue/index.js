// B"H
const FromGoal = require('./fromGoal.js');
const Progress = require('./progress.js');
function ensure(m) { m.workQueue ||= FromGoal.create(m); return m.workQueue; }
function refresh(m, input = {}) {
  const q = ensure(m);
  const more = FromGoal.items(m, input);
  const known = new Set(q.items.map(x => x.key));
  for (const item of more) if (!known.has(item.key)) q.items.push(item);
  q.updatedAt = new Date().toISOString();
  Progress.recount(q);
  return q;
}
function pending(m) { return ensure(m).items.find(x => x.status !== 'done') || null; }
function applyStep(m, step = {}, input = {}) {
  const q = ensure(m), key = step.workKey || step.id;
  const item = q.items.find(x => x.key === key) || null;
  if (!item) return Progress.recount(q);
  if (input.blocked) item.status = 'blocked';
  else if (input.executed || input.done || input.evidence || input.proof || input.actual) item.status = 'done';
  else item.status = item.kind === 'plan' ? 'done' : 'in_progress';
  item.lastEvidence = input.evidence || input.proof || input.actual || input.output || '';
  item.updatedAt = new Date().toISOString();
  return Progress.recount(q);
}
function summary(m) { return Progress.summary(ensure(m)); }
module.exports = { ensure, refresh, pending, applyStep, summary };
