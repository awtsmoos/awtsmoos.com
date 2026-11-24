// B"H
// K1 ruling (Tunnel Revelation, 2026-11-25): the public GPT surface is
// deliberately 14 body-first capabilities with NO internal operation enums.
// This test asserts that surface — it must never resurrect internal enums.
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const Surface = require('../../geelooy/apps/tunnel/agent/lib/public-action-surface.js');
const yamlPath = path.join(__dirname, '../../geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.yaml');
const livePath = path.join(__dirname, '../../geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.generated-live.yaml');
const CAPS = ['agent','batch','browser','command','files','git','mission','preview','recover','runtime','status','system','test','web'];
assert.deepEqual([...Surface.PUBLIC_ACTIONS], CAPS, 'public surface must stay the 14 capabilities');
const INTERNAL = ['agentDoctor','read','commandRun','chatgptSeasonSaveAndContinue','chatgptAutoPilotSession','chatgptSaveCurrentSeason','chatgptSessionContinue'];
const BODY_PARAMS = { conversationUrl:'string', chatgptUrl:'string', sessionId:'string', chatgptSessionId:'string', maxTurns:'integer', batchTurns:'integer', optimizeDom:'boolean', closeOldTabs:'boolean' };
for (const file of [yamlPath, livePath]) {
  const text = fs.readFileSync(file, 'utf8');
  assert.ok(/^openapi: 3\.1\.0/m.test(text), `OpenAPI header missing from ${file}`);
  const post = text.split('operationId: awtsmoosTunnelActionLegacyGet')[0];
  assert.ok(post.includes('operationId: awtsmoosTunnelAction'), `POST action missing from ${file}`);
  assert.ok(post.includes('requestBody:') && post.includes('application/json:'), `POST JSON body missing from ${file}`);
  for (const cap of CAPS) assert.ok(post.includes(`                    - ${cap}`), `capability ${cap} missing from POST body enum in ${file}`);
  for (const [name, type] of Object.entries(BODY_PARAMS)) assert.ok(post.includes(`${name}: { type: ${type}`), `body param ${name} missing from ${file}`);
  assert.ok(text.includes('action=browser with operation=chatgptSeasonSaveAndContinue'), `ChatGPT-via-browser guidance missing from ${file}`);
  assert.ok(text.includes('Use POST awtsmoosTunnelAction for large'), `body-first guidance missing from ${file}`);
  for (const op of INTERNAL) assert.ok(!text.includes(`              - ${op}`), `internal enum ${op} leaked into ${file}`);
}
console.log("B'H ChatGPT OpenAPI YAML: 14-capability body-first no-leak surface ok");
