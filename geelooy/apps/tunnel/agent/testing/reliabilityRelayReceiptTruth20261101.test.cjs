// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Tests the boundary between a living relay and verified execution.
 * The Awtsmoos kindles every breath as a new and measured light;
 * Awtsmoos.com must never call a heartbeat a completed flight.
 * Each synthetic receipt crosses the existing production readiness function,
 * without changing device identity, opening sockets, or writing user files.
 */
const assert = require('node:assert/strict');
const test = require('node:test');
const { snapshot } = require('../lib/local-api-readiness.js');

const observationTime = Date.parse('2026-11-01T22:00:00.000Z');

/** Constructs a deterministic, explicitly synthetic registration receipt. */
function createReceipt(changes = {}) {
	return {
		state: 'registered',
		ownerPid: 11,
		connectionPid: 12,
		updatedAt: '2026-11-01T21:59:59.000Z',
		agentVersion: 'synthetic-test-agent',
		...changes
	};
}

/** Evaluates a synthetic receipt without touching native processes. */
function evaluateReceipt(receipt, availablePids = [11, 12]) {
	return snapshot(receipt, {
		now: observationTime,
		alive: pid => availablePids.includes(pid)
	});
}

test('missing receipt cannot establish relay readiness', () => {
	const result = evaluateReceipt(null);
	assert.equal(result.relayReady, false);
	assert.equal(result.reason, 'connection_receipt_missing');
});

test('healthy relay is not an execution proof', () => {
	const result = evaluateReceipt(createReceipt());
	assert.equal(result.relayReady, true);
	assert.equal(result.reason, '');
	assert.equal(result.commandExecution, 'not_probed');
	assert.equal(result.evidence, 'registered_connection_receipt');
});

test('unregistered relay cannot be reported ready', () => {
	const result = evaluateReceipt(createReceipt({ state: 'connecting' }));
	assert.equal(result.relayReady, false);
	assert.equal(result.reason, 'relay_not_registered');
});

test('missing owner process blocks readiness', () => {
	const result = evaluateReceipt(createReceipt(), [12]);
	assert.equal(result.relayReady, false);
	assert.equal(result.reason, 'parent_not_alive');
});

test('missing connection process blocks readiness', () => {
	const result = evaluateReceipt(createReceipt(), [11]);
	assert.equal(result.relayReady, false);
	assert.equal(result.reason, 'connection_not_alive');
});

test('stale receipt blocks readiness', () => {
	const result = evaluateReceipt(createReceipt({
		updatedAt: '2026-11-01T21:58:00.000Z'
	}));
	assert.equal(result.relayReady, false);
	assert.equal(result.reason, 'relay_receipt_stale');
});

test('receipt more than five seconds ahead is not fresh', () => {
	const result = evaluateReceipt(createReceipt({
		updatedAt: '2026-11-01T22:00:06.000Z'
	}));
	assert.equal(result.relayReady, false);
	assert.equal(result.reason, 'relay_receipt_stale');
});

test('healthy receipt at 90-second limit is accepted', () => {
	const result = evaluateReceipt(createReceipt({
		updatedAt: '2026-11-01T21:58:30.000Z'
	}));
	assert.equal(result.relayReady, true);
	assert.equal(result.commandExecution, 'not_probed');
});
