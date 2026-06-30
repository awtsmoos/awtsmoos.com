// B"H
process.env.AWTAI_NO_NATIVE = '1';
const assert = require('assert');
const { nativeStatus } = require('../native/native-matvec.js');
const status = nativeStatus();
assert.strictEqual(status.disabled, true);
assert.strictEqual(status.active, false);
console.log(JSON.stringify({ ok: true, test: 'no-native-status', status }));
