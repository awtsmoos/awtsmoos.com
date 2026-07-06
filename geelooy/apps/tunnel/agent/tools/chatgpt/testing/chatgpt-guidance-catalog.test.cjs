// B"H
const assert = require('assert');
const { buildActions } = require('../../fs/actions.js');
const { buildToolCatalog } = require('../../../lib/tool-schema-catalog.js');
const Sessions = require('../actions/sessions.js');
const config = { root:process.cwd(), allowWrite:true, allowCommands:true, allowSecrets:false, tools:{ chrome:true, fsRead:true, fsWrite:true, fsBulk:true, fsList:true, fsTree:true }, chrome:{ enabled:true, port:9223 } };
const actions = buildActions(config, { action:'actionCatalog' }, null);
const names = Object.keys(actions).filter(n => n.startsWith('chatgpt')).sort();
const catalog = buildToolCatalog({ config, fsActionNames:names, agentVersion:'test' });
assert.equal(catalog.guidance.chatgpt.preferredAction, 'chatgptSeasonSaveAndContinue');
assert.ok(catalog.guidance.chatgpt.workflow.join('\n').includes('Do not manually script waiting loops'));
assert.ok(catalog.yaml.includes('preferredAction'));
assert.ok(catalog.yaml.includes('chatgptSeasonSaveAndContinue'));
(async () => {
  const registered = await Sessions.chatgptRegisterSession({ url:'https://chatgpt.com/c/guidance_test', maxTurns:2 });
  const rule = registered.guidance.rule;
  assert.ok(rule.includes('ChatGPT conversation URL'));
  assert.ok(rule.includes('visible conversation is idle'));
  assert.ok(rule.includes('Do not manually recreate wait loops'));
  assert.equal(registered.guidance.preferredStartAction, 'chatgptSeasonSaveAndContinue');
  console.log(JSON.stringify({ ok:true, suite:'chatgpt-guidance-catalog' }, null, 2));
})().catch(e => { console.error(e); process.exit(1); });
