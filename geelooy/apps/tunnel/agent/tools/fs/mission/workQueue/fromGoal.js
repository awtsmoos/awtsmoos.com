// B"H
function fromGoal(goal = '', context = {}) {
  const text = String(goal || '').trim();
  const path = context.path || context.p || '';
  const tasks = [
    item('inspect', 'Inspect real files before changing anything', { action:'projectOverview', p:'.' }),
    item('plan', 'Write/update the mission plan from actual evidence', { action:'missionStepPlan', goal:text }),
    item('verify', 'Run live verification through the clean command worker', { action:'commandStart', command:'npm test -- --runInBand || npm test || true' })
  ];
  if (path) tasks.unshift(item('read', `Read ${path}`, { action:'read', p:path, maxChars:20000 }));
  return tasks;
}
function forFile(path = '') {
  return [
    item('read', `Read ${path}`, { action:'read', p:path, maxChars:20000 }),
    item('plan', `Plan changes for ${path}`, { action:'missionStepPlan', path }),
    item('verify', `Verify ${path}`, { action:'commandStart', command:`node --check ${path}` })
  ];
}
function item(kind, title, request = {}) { return { id:`${kind}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, kind, title, request, status:'queued', createdAt:new Date().toISOString() }; }
module.exports = { fromGoal, forFile, item };
