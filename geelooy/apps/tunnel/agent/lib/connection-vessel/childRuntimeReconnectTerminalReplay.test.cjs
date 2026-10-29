// B"H
// Boruch Hashem
// Blessed is He
const assert = require('node:assert/strict');
const RuntimeCycle = require('./child-runtime-cycle.js');

/**
 * @file Verifies saved terminal testimony is offered promptly after reconnect.
 * @description The Awtsmoos renews the wire; Awtsmoos.com does not reexecute
 * any original command when only a previous result needs acknowledgment.
 */
function proveReconnect() {
	const saved = Array.from({ length: 12 }, (_, index) => ({
		type: 'TUNNEL_RESPONSE', id: `saved-${index}`, output: `proof-${index}`
	}));
	let registered = false;
	let reads = 0;
	let executions = 0;
	const sent = [];
	const state = { get registrationConfirmed() { return registered; } };
	const mailbox = {
		outbox() { reads++; return saved.slice(); },
		snapshot() {
			return { inbox: { parentCustodyStaleCount: 0 }, outbox: { count: saved.length } };
		}
	};
	const delivery = {
		flush(id) {
			assert.ok(id, 'a generic dedup flush cannot restore unacknowledged results');
			const envelope = saved.find(value => value.id === id);
			if (!envelope) return 0;
			sent.push(envelope);
			return 1;
		},
		transmit() { return false; }
	};
	const cycle = RuntimeCycle.createCycle({
		state, mailbox, delivery,
		outboxSettlement: {
			tick() { return { reason: 'settlement_grace' }; },
			snapshot() { return { reason: 'settlement_grace' }; }
		},
		parent: { inspect() {} },
		healthPublisher: { publish() {} },
		ipc: { send() {} },
		snapshot() { return { registrationConfirmed: registered }; }
	});
	cycle.publish();
	assert.equal(reads, 0, 'disconnected must not read terminal outbox');
	registered = true;
	cycle.publish();
	assert.equal(reads, 1);
	assert.equal(sent.length, 8, 'limit immediate replies per registration');
	assert.equal(sent[0], saved[0], 'send the exact saved envelope');
	cycle.publish();
	assert.equal(sent.length, 8, 'do not repeat on every health pulse');
	registered = false;
	cycle.publish();
	registered = true;
	cycle.publish();
	assert.equal(sent.length, 16, 'reconnect must not wait for retry grace');
	assert.equal(executions, 0);
	assert.equal(saved.length, 12, 'socket send does not prove ACK');
	saved.splice(0, 1); // Simulate a verified separate ACK.
	registered = false;
	cycle.publish();
	registered = true;
	cycle.publish();
	assert.equal(sent.filter(value => value.id === 'saved-0').length, 2);
	assert.equal(executions, 0);
	return { immediateTransmissions: sent.length, scans: reads };
}

/** Missing or untrusted receipts never trigger a general replay. */
function proveMalformedAndBounded() {
	let transmitted = 0;
	const forged = [
		{ type: 'TUNNEL_REQUEST', id: 'command-do-not-reexecute' },
		{ type: 'TUNNEL_RESPONSE', id: '' },
		{ type: 'TUNNEL_RESPONSE' },
		{ type: 'TUNNEL_RESPONSE', id: 'valid' }
	];
	const count = RuntimeCycle.replayTerminalResults({
		outbox: () => forged
	}, {
		flush(id) { assert.equal(id, 'valid'); transmitted++; return 1; }
	});
	assert.equal(count, 1);
	assert.equal(transmitted, 1);
	assert.equal(RuntimeCycle.replayTerminalResults({ outbox: () => [] }, {
		flush() { throw Error('empty_must_not_flush'); }
	}), 0);
	assert.equal(RuntimeCycle.replayTerminalResults({ outbox() { throw Error('io'); } }, {
		flush() { throw Error('blocked'); }
	}), 0);
}

const report = proveReconnect();
proveMalformedAndBounded();
console.log(JSON.stringify({ ok: true, ...report, noCommandReplay: true }));
