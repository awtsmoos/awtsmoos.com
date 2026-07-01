// B"H
const assert = require('assert');
const Recovery = require('../lib/runtime/recovery-envelope.js');
const receipt = Recovery.fallbackReceipt(
  { action: 'write', path: '/tmp/file.txt', tunnelName: 'awt-awtsmoos-2113' },
  { safeToReplay: true, requiresConfirmation: false, fallbackVesselType: 'awtsmoos-code' }
);
assert.strictEqual(receipt.requestAction, 'write');
assert.strictEqual(receipt.actualAction, 'write');
assert.strictEqual(receipt.targetTunnelName, 'awt-awtsmoos-2113');
assert.strictEqual(receipt.targetVesselType, 'native-local');
assert.strictEqual(receipt.fallbackVesselType, 'awtsmoos-code');
assert.strictEqual(receipt.status, 'queued_waiting_for_reconnect');
assert.strictEqual(receipt.safeToReplay, true);
assert.strictEqual(receipt.requiresConfirmation, false);
console.log('fallback vessel receipt preserves original action identity');
