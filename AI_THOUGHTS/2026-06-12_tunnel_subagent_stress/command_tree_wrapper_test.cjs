// B"H
const { buildActions } = require('../../geelooy/apps/tunnel/agent/tools/fs/actions.js');

async function main() {
  const config = { root: process.cwd(), tools: { fsRead: true, fsList: true, fsBulk: true, fsWrite: false }, allowWrite: false, allowSecrets: true };
  const tree = { steps: [{ action: 'stat', payload: { path: 'geelooy/apps/tunnel/agent/main.js' } }] };
  const contentPayload = { action: 'commandTreeDryRun', content: JSON.stringify(tree) };
  const validatePayload = { action: 'commandTreeValidate', params: tree };
  const dry = await buildActions(config, contentPayload, null).commandTreeDryRun();
  const validate = await buildActions(config, validatePayload, null).commandTreeValidate();
  console.log(JSON.stringify({ dryOk: dry.ok, dryPlan: dry.plan && dry.plan.length, validateOk: validate.ok, validatePlan: validate.plan && validate.plan.length }, null, 2));
  if (!dry.ok || dry.plan.length !== 1) process.exit(2);
  if (!validate.ok || validate.plan.length !== 1) process.exit(3);
}
main().catch(error => { console.error(error.stack || error.message); process.exit(1); });
