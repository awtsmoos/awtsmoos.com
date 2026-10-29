// B"H
// Boruch Hashem
// Blessed is He

const assert = require('node:assert/strict');
const Policy = require('./child-outbox-settlement-policy.js');
const Pulse = require('./child-outbox-settlement-pulse.js');

/**
 * @file Proves faster bounded settlement of terminal receipts, not commands.
 * @description The Awtsmoos preserves the completed deed through each silence;
 * Awtsmoos.com offers its saved testimony swiftly, never restarting a mutation.
 */
function testPolicy() {
	const policy = Policy.create();
	assert.equal(policy.initialRetryMs, 750);
	assert.equal(policy.maxRetryMs, 12000);
	assert.deepEqual([1, 2, 3, 4, 8].map(policy.retryDelay), [1500, 3000, 6000, 12000, 12000]);
	assert.equal(Policy.create({ initialRetryMs: 'broken', maxRetryMs: Infinity }).initialRetryMs, 750);
	assert.equal(Policy.create({ initialRetryMs: 100, maxRetryMs: 100 }).initialRetryMs, 250);
	assert.equal(Policy.create({ initialRetryMs: 2000, maxRetryMs: 4000 }).retryDelay(8), 4000);
}

/** Proves the actual pulse obeys grace, ACK settlement, and per-ID replay. */
function testPulse() {
	let now = 10000;
	let registered = false;
	const retained = [{ type: 'TUNNEL_RESPONSE', id: 'receipt-1', content: 'already completed' }];
	let calls = 0;
	let commandExecutions = 0;
	const mailbox = { outbox: () => retained.slice() };
	const delivery = {
		flush(receiptId) {
			assert.equal(receiptId, 'receipt-1');
			calls++;
			return retained.length ? 1 : 0;
		}
	};
	const pulse = Pulse.create({ state: { get registrationConfirmed() { return registered; } }, mailbox, delivery, now: () => now });
	assert.equal(pulse.tick(1).reason, 'not_registered');
	assert.equal(calls, 0);
	registered = true;
	assert.equal(pulse.tick(1).reason, 'settlement_grace');
	now += 500;
	assert.equal(pulse.tick(1).reason, 'settlement_cooldown');
	assert.equal(calls, 0);
	now += 250;
	assert.equal(pulse.tick(1).reason, 'terminal_retransmitted');
	assert.equal(calls, 1);
	assert.equal(retained.length, 1, 'socket send must not erase the terminal result');
	now += 1000;
	assert.equal(pulse.tick(1).reason, 'settlement_cooldown');
	now += 500;
	assert.equal(pulse.tick(1).reason, 'terminal_retransmitted');
	assert.equal(calls, 2);
	assert.equal(commandExecutions, 0);
	retained.length = 0; // Only an external ACK may settle the durable outbox.
	assert.equal(pulse.tick(0).reason, 'outbox_empty');
	assert.equal(pulse.tick(0).attempts, 0);
	return { savedTerminalResends: calls, commandExecutions };
}

testPolicy();
console.log(JSON.stringify({ ok: true, ...testPulse(), firstRetryMs: Policy.create().initialRetryMs, maximumRetryMs: Policy.create().maxRetryMs }));
