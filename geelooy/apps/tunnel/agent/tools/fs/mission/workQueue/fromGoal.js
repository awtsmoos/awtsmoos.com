// B"H
function fromGoal(goal = '', context = {}) {
  const text = String(goal || '').trim();
  const paths = unique([
    context.path || context.p || '',
    ...pathsFromText(text)
  ]);
  const tasks = [
    item('inspect', 'Inspect real files before changing anything', { action:'projectOverview', p:'.' }),
    item('plan', 'Write/update the mission plan from actual evidence', { action:'missionStepPlan', goal:text })
  ];
  for (const path of paths) tasks.push(...forFile(path));
  if (!paths.length) {
    tasks.push(item('write', 'Implement the mission in complete project files', {
      action:'missionStepPlan', goal:text
    }));
  }
  tasks.push(item('verify', 'Run live verification through the clean command worker', {
    action:'commandStart', command:'npm test -- --runInBand || npm test || true'
  }));
  return uniqueItems(tasks);
}
function forFile(path = '') {
  return [
    item('read', `Read ${path}`, { action:'read', p:path, maxChars:20000 }),
    item('write', `Rewrite ${path} completely from verified evidence`, { action:'write', path }),
    item('verify', `Verify ${path}`, { action:'commandStart', command:`node --check ${path}` })
  ];
}
function item(kind, title, payload = {}) {
  const identity = payload.path || payload.p || payload.command || title;
  return {
    key: `${kind}:${String(identity).trim()}`,
    kind,
    title,
    payload,
    status:'pending',
    createdAt:new Date().toISOString()
  };
}
function create(mission = {}) {
  const now = new Date().toISOString();
  return { items: items(mission), createdAt: now, updatedAt: now };
}
function items(mission = {}, context = {}) {
  return fromGoal(mission.goal, context);
}
function pathsFromText(text = '') {
  return String(text).match(/(?:^|\s)([\w.-]+(?:\/[\w.@+-]+)+\.[A-Za-z0-9]+)(?=\s|$|[.,;:])/g)
    ?.map(value => value.trim().replace(/[.,;:]$/, '')) || [];
}
function unique(values) { return [...new Set(values.map(String).map(value => value.trim()).filter(Boolean))]; }
function uniqueItems(values) {
  const known = new Set();
  return values.filter(value => !known.has(value.key) && known.add(value.key));
}
module.exports = { create, fromGoal, forFile, item, items, pathsFromText };
