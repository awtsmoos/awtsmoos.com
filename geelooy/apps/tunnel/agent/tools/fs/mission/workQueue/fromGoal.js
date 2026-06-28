// B"H
function clean(v = '') { return String(v || '').trim(); }
function words(v = '') { return clean(v).split(/\s+/).filter(Boolean); }
function fileHints(input = {}, m = {}) {
  const text = [input.goal, input.prompt, input.query, input.text, m.goal, m.title, m.definitionOfDone].map(clean).join(' ');
  const found = text.match(/[A-Za-z0-9_./-]+\.(js|mjs|cjs|ts|tsx|jsx|css|html|json|md|c|cpp|h|py|sh)/g) || [];
  return [...new Set(found)].slice(0, 12);
}
function item(kind, title, payload = {}) {
  const key = `${kind}:${title}:${payload.path || payload.command || ''}`.replace(/\s+/g, '_').slice(0, 180);
  return { key, kind, title, status: 'pending', payload, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}
function generic(m = {}, input = {}) {
  const hints = fileHints(input, m);
  const target = hints[0] || '.';
  const items = [
    item('inspect', `Inspect project reality for ${target}`, { action: 'tree', path: target === '.' ? '.' : target.split('/').slice(0, -1).join('/') || '.' }),
    item('read', `Read relevant source ${target}`, { action: 'read', path: target }),
    item('plan', 'Write concrete file-touch plan', {}),
    item('write', `Rewrite complete files required by mission`, { action: 'write', path: target }),
    item('verify', 'Run live verification through tunnel', { action: 'commandRun', command: 'npm test -- --runInBand || npm test || true' }),
    item('review', 'Review changed files and remaining work', { action: 'gitDiffSmart' }),
    item('debt', 'Measure remaining work debt', {}),
    item('continue', 'Continue with next highest value file task', {})
  ];
  return items;
}
function items(m = {}, input = {}) {
  const hints = fileHints(input, m);
  const base = generic(m, input);
  const extra = hints.flatMap(path => [
    item('read', `Read ${path}`, { action: 'read', path }),
    item('write', `Rewrite ${path} if needed`, { action: 'write', path }),
    item('verify', `Verify ${path}`, { action: 'commandRun', command: `node --check ${path}` })
  ]);
  return [...base, ...extra].slice(0, 40);
}
function create(m = {}, input = {}) { return { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), items: items(m, input), progress: {} }; }
module.exports = { create, items, fileHints, item, words };
