// B"H
const fs = require('fs');
const { handleFsAction } = require('../geelooy/apps/tunnel/agent/tools/fs/actions.js');

(async () => {
  const response = await handleFsAction({ action: '__missing_for_surface__' }, {});
  const names = [...new Set(response.availableActions || [])].sort();
  const lines = [
    '// B"H',
    '/**',
    ' * Generated public tunnel action surface.',
    ' * Source: local agent dispatcher availableActions.',
    ' */',
    'const actions = [',
    ...names.map((name, index) => `  ${JSON.stringify(name)}${index === names.length - 1 ? '' : ','}`),
    '];',
    '',
    'module.exports = { actions };',
    ''
  ];
  fs.writeFileSync('geelooy/api/tunnel/control/docs/actions.js', lines.join('\n'), 'utf8');
  console.log(JSON.stringify({ ok: true, count: names.length }, null, 2));
})().catch(error => {
  console.error(error.stack || error);
  process.exit(1);
});
