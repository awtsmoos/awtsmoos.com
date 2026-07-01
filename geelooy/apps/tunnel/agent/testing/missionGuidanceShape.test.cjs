// B"H
const assert = require('assert');
const Diagnostics = require('../tools/fs/mission/diagnostics.js');
const Compact = require('../tools/fs/mission/response/compact.js');
const sample = { ok: false, action: 'missionNext8Plan', finalAnswerAllowed: false, mustContinue: true, mustCallNext: { action: 'missionExecuteNext8', missionId: 'm1' }, reason: 'continue_required' };
const d = Diagnostics.explain(sample);
assert.strictEqual(d.operatingRules.language, 'concise-plain-english');
assert.ok(!d.plainEnglishAllCaps);
assert.ok(d.agentGuidance.plainEnglish.length < 700);
const c = Compact.compact(sample, {});
const text = JSON.stringify(c);
assert.strictEqual(c.responseShape, 'focused-mission-v7-concise');
assert.ok(!Object.prototype.hasOwnProperty.call(c, 'plainEnglishAllCaps'));
assert.ok(!/ABSOLUTE MISSION FREEDOM/.test(text));
assert.ok(text.length < 5000);
console.log('mission guidance is concise');
