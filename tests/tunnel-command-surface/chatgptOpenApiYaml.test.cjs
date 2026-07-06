// B"H
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const yamlPath = path.join(__dirname, '../../geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.yaml');
const livePath = path.join(__dirname, '../../geelooy/apps/tunnel-control/gpt/awtsmoos-action-openapi.generated-live.yaml');
for (const file of [yamlPath, livePath]) {
  const text = fs.readFileSync(file, 'utf8');
  for (const action of ['chatgptSeasonSaveAndContinue','chatgptAutoPilotSession','chatgptSaveCurrentSeason','chatgptSessionContinue']) assert.ok(text.includes(`              - ${action}`), `${action} missing from ${file}`);
  for (const param of ['conversationUrl','chatgptUrl','sessionId','chatgptSessionId','maxTurns','batchTurns','optimizeDom','closeOldTabs']) assert.ok(text.includes(`name: ${param}`), `${param} missing from ${file}`);
  assert.ok(text.includes('Do not manually recreate wait loops'), `ChatGPT workflow guidance missing from ${file}`);
  assert.ok(/^openapi: 3\.1\.0/m.test(text), `OpenAPI header missing from ${file}`);
}
console.log("B'H ChatGPT OpenAPI YAML actions/params/guidance ok");
