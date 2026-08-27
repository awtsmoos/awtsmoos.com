// B"H
import assert from 'assert';
import { BrowserCommandAdapter } from '../BrowserCommandAdapter.js';
import { browserFallbackReceipt } from '../browser-command-policy.js';

const adapter = new BrowserCommandAdapter({ fs: { async call() { return { items: [] }; } } });
const got = await adapter.run({ command: 'npm install', tunnelName: 'awt-awtsmoos-2113' });
assert.strictEqual(got.ok, false);
assert.strictEqual(got.action, 'commandRun');
assert.strictEqual(got.requestAction, 'commandRun');
assert.strictEqual(got.actualAction, 'commandRun');
assert.strictEqual(got.error, 'browser_command_not_native');
assert.strictEqual(got.commandMode, 'unsupported');
assert.strictEqual(got.recovery.fallback, 'queue_for_native_tunnel');
assert.strictEqual(got.receipt.requestAction, 'commandRun');
assert.strictEqual(got.receipt.actualAction, 'commandRun');
assert.strictEqual(got.receipt.targetTunnelName, 'awt-awtsmoos-2113');
assert.strictEqual(got.receipt.fallbackVesselType, 'awtsmoos-code');

const receipt = browserFallbackReceipt({ action: 'write', tunnelName: 'native' }, { safeToReplay: true });
assert.strictEqual(receipt.requestAction, 'write');
assert.strictEqual(receipt.safeToReplay, true);
console.log('BHY browser fallback receipt tests passed');
