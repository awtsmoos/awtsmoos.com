// B"H
function simulate(item = {}) {
  if (item.kind === 'verify-syntax') return { action:'commandStart', command:`node --check ${item.path}`, cwd:'.' };
  if (item.kind === 'verify-command') return { action:'commandStart', command:item.command || 'npm test || true', cwd:item.cwd || '.' };
  return { action:'missionStepPlan', goal:item.title || item.kind || 'continue mission improvement' };
}
module.exports = { simulate };
