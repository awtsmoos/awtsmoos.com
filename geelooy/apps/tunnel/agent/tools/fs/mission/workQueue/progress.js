// B"H
function recount(q = {}) {
  const items = q.items || [];
  const done = items.filter(x => x.status === 'done').length;
  const blocked = items.filter(x => x.status === 'blocked').length;
  const inProgress = items.filter(x => x.status === 'in_progress').length;
  const pending = items.length - done - blocked - inProgress;
  const filesTouched = items.filter(x => x.kind === 'write' && x.status === 'done').map(x => x.payload?.path || x.title).filter(Boolean);
  const testsRun = items.filter(x => x.kind === 'verify' && x.status === 'done').length;
  q.progress = { total: items.length, done, blocked, inProgress, pending, filesTouched, testsRun, percent: items.length ? Math.round((done / items.length) * 100) : 0, updatedAt: new Date().toISOString() };
  return q.progress;
}
function summary(q = {}) {
  const progress = recount(q);
  return { ...progress, remaining: (q.items || []).filter(x => x.status !== 'done').slice(0, 8).map(x => ({ kind: x.kind, title: x.title, status: x.status, payload: x.payload })) };
}
function shrank(before = {}, after = {}) { return Number(after.done || 0) > Number(before.done || 0) || Number(after.pending || 0) < Number(before.pending || 0); }
module.exports = { recount, summary, shrank };
