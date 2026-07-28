// B"H
const assert = require('assert');
const fs = require('fs');
const { buildToolCatalog } = require('../lib/tool-schema-catalog.js');
const catalog = buildToolCatalog({ fsActionNames:['chatgptSeasonSaveAndContinue','write','actionBatch','retryAction'], agentVersion:'split-test' });
assert.ok(catalog.yaml.includes('chatgptSeasonSaveAndContinue'));
assert.ok(catalog.guidance.chatgpt.workflow.join('\n').includes('Do not manually script waiting loops'));
assert.ok(catalog.schemas.chatgptSeasonSaveAndContinue.properties.url);
assert.ok(catalog.schemas.retryAction.properties.controlRequestId);
assert.ok(catalog.schemas.retryAction.properties.params);
assert.equal(catalog.schemas.retryAction.required?.includes('controlRequestId'), false);
for (const file of ['tool-schema-catalog.js','tool-schema/fs.js','tool-schema/yaml.js','tool-schema/chatgpt.js']) {
  const lines = fs.readFileSync(require('path').join(__dirname, '../lib', file), 'utf8').split('\n').length;
  assert.ok(lines <= 120, `${file} too large: ${lines}`);
}
console.log(JSON.stringify({ ok:true, suite:'toolSchemaSplit', names:catalog.names.length }, null, 2));
