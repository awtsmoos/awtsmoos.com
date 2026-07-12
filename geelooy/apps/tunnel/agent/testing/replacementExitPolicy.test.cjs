// B"H
const assert = require('node:assert/strict');
const Replacement = require('../lib/runtime/replacement-policy.js');

/** B"H — The older duplicate closes, refuses reconnect, and exits exactly once. */
(() => {
	let cleared = 0;
	let closed = 0;
	let exitCode = null;
	let timerCallback = null;
	let unreferenced = false;
	const receipt = Replacement.exitBecauseNewerConnectionOwnsTunnel({
		reason: 'test_newer_owner',
		delayMs: 0,
		clearReconnect: () => { cleared += 1; },
		close: () => { closed += 1; },
		log: () => {},
		exit: code => { exitCode = code; },
		setTimer(callback, delayMs) {
			assert.equal(delayMs, 0);
			timerCallback = callback;
			return { unref() { unreferenced = true; } };
		}
	});
	assert.equal(Replacement.isReplacementMessage({ type: 'TUNNEL_REPLACED' }), true);
	assert.equal(Replacement.isReplacementMessage({ type: 'TUNNEL_REQUEST' }), false);
	assert.equal(receipt.action, 'exitBecauseNewerConnectionOwnsTunnel');
	assert.equal(receipt.reason, 'test_newer_owner');
	assert.equal(cleared, 1);
	assert.equal(closed, 1);
	assert.equal(unreferenced, true);
	assert.equal(exitCode, null);
	timerCallback();
	assert.equal(exitCode, 0);
	console.log(JSON.stringify({ ok: true, suite: 'replacement-exit-policy' }, null, 2));
})();
