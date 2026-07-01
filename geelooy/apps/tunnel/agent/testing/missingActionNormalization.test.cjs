// B"H
const assert = require('assert');
const Payload = require('../tools/fs/actionGroups/missionActionPayload.js');
const Recovery = require('../lib/runtime/recovery-envelope.js');
let got = Payload.mergedPayload({ requestAction: 'read', params: JSON.stringify({ path: 'x.txt' }) });
assert.strictEqual(got.normalized, true);
assert.strictEqual(got.action, 'read');
assert.strictEqual(got.requestAction, 'read');
assert.strictEqual(got.actualAction, 'read');
got = Payload.mergedPayload({ payload: { action: 'write' }, params: JSON.stringify({ action: 'missionNextPlan' }) });
assert.strictEqual(got.action, 'write');
assert.strictEqual(got.requestAction, 'write');
got = Recovery.missingActionEnvelope({ p: 'x' });
assert.strictEqual(got.error, 'missing_action');
assert.strictEqual(got.action, 'unknown');
assert.strictEqual(got.actionMismatch, false);
assert.deepStrictEqual(got.recovery, { suggestedAction: 'actionSchemaTrace' });
console.log('missing action normalization is diagnostic and identity preserving');
