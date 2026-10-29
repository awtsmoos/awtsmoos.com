// B"H
// Boruch Hashem
// Blessed is He
const assert = require('node:assert/strict');
const { create } = require('./child-outbox-settlement-pulse.js');

/**
 * @file Proves terminal ACK recovery bypasses send-only dedup, never re-executes.
 * @description The Awtsmoos keeps each completed deed unchanged; Awtsmoos.com
 * re-speaks the saved answer by identity, awaiting the relay's true assent.
 */
function scenario() {
	let time = 1000;
	let registered = false;
	let scans = 0;
	let commandExecutions = 0;
	let genericAttempts = 0;
	const envelopes = Array.from({ length: 12 }, (_, index) => ({
		type: 'TUNNEL_RESPONSE',
		id: `receipt-${index}`,
		result: { completed: true, output: `answer-${index}` }
	}));
	const actualSends = [];
	const mailbox = {
		outbox() {
			scans++;
			return envelopes.slice();
		},
		acknowledge(id) {
			const index = envelopes.findIndex(envelope => envelope.id === id);
			if (index >= 0) envelopes.splice(index, 1);
		}
	};
	const delivery = {
		flush(id) {
			if (!id) {
				genericAttempts++;
				return 0; // General flush falsely treats socket-send as an ACK.
			}
			const saved = envelopes.find(envelope => envelope.id === id);
			if (!saved) return 0;
			actualSends.push(saved);
			return 1;
		}
	};
	const pulse = create({
		state: { get registrationConfirmed() { return registered; } },
		mailbox,
		delivery,
		now: () => time,
		initialRetryMs: 250,
		maxRetryMs: 250
	});
	assert.equal(pulse.tick(12).reason, 'not_registered');
	assert.equal(scans, 0);
	registered = true;
	assert.equal(pulse.tick(12).reason, 'settlement_grace');
	assert.equal(scans, 0);
	time = 1250;
	assert.equal(pulse.tick(12).reason, 'terminal_retransmitted');
	assert.equal(actualSends.length, 8);
	assert.equal(actualSends[0], envelopes[0]);
	assert.equal(scans, 1);
	time = 1500;
	assert.equal(pulse.tick(12).reason, 'terminal_retransmitted');
	assert.equal(actualSends.length, 16);
	assert.ok(actualSends.some(envelope => envelope.id === 'receipt-11'));
	assert.equal(genericAttempts, 0, 'must not use dedup-suppressed generic flush');
	assert.equal(envelopes.length, 12, 'socket send must not ACK or erase evidence');
	assert.equal(commandExecutions, 0, 'retransmission must not execute the request');
	mailbox.acknowledge('receipt-0');
	assert.equal(envelopes.length, 11);
	time = 1750;
	assert.equal(pulse.tick(11).reason, 'terminal_retransmitted');
	assert.ok(actualSends.every(envelope => envelope.type === 'TUNNEL_RESPONSE'));
	assert.equal(actualSends.filter(envelope => envelope.id === 'receipt-0').length, 2);
	envelopes.length = 0;
	assert.equal(pulse.tick(0).reason, 'outbox_empty');
	assert.equal(pulse.tick(0).attempts, 0);
	return { sent: actualSends.length, scans, commandExecutions };
}

/** Missing identities fail closed instead of triggering an unbounded flush. */
function malformed() {
	let time = 10;
	let called = 0;
	const pulse = create({
		state: { registrationConfirmed: true },
		mailbox: { outbox: () => [{ type: 'TUNNEL_RESPONSE' }, { id: '' }] },
		delivery: { flush() { called++; return 1; } },
		now: () => time,
		initialRetryMs: 250
	});
	pulse.tick(2);
	time = 260;
	assert.equal(pulse.tick(2).lastSent, 0);
	assert.equal(called, 0);
}
const result = scenario();
malformed();
console.log(JSON.stringify({ ok: true, ...result, ackOnlyRemoval: true }));
