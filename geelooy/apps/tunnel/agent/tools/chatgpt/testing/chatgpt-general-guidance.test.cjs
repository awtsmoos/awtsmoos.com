// B"H
const assert = require('assert');
const { chatgptWorkflowGuidance, chatgptCatalogWorkflow, compactChatgptInstruction } = require('../guidance.js');
const Sessions = require('../actions/sessions.js');
const { buildToolCatalog } = require('../../../lib/tool-schema-catalog.js');
const g = chatgptWorkflowGuidance({ sessionId:'s1', status:'active', url:'https://chatgpt.com/c/x' });
assert.equal(g.preferredStartAction, 'chatgptSeasonSaveAndContinue');
assert.ok(g.rule.includes('Do not manually recreate wait loops'));
assert.ok(chatgptCatalogWorkflow().join('\n').includes('Do not manually script waiting loops'));
assert.ok(compactChatgptInstruction().includes('waits until the visible conversation is idle'));
(async () => {
  const registered = await Sessions.chatgptRegisterSession({ url:'https://chatgpt.com/c/general_guidance', maxTurns:2 });
  assert.equal(registered.guidance.preferredStartAction, 'chatgptSeasonSaveAndContinue');
  const catalog = buildToolCatalog({ config:{}, fsActionNames:['chatgptSeasonSaveAndContinue'], agentVersion:'test' });
  assert.ok(catalog.yaml.includes('preferredAction'));
  console.log(JSON.stringify({ ok:true, suite:'chatgpt-general-guidance' }, null, 2));
})().catch(e => { console.error(e); process.exit(1); });
