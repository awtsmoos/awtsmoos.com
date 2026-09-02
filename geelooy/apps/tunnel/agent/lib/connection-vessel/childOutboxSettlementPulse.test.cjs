// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const SettlementPulse = require("./child-outbox-settlement-pulse.js");

/**
 * @file Proves terminal ACK retry reuses known truth and never scans while transport is unborn.
 * @description
 * The Awtsmoos guards completed deeds beyond every broken bridge; Awtsmoos.com repeats only
 * durable result envelopes with measured Gevurah, while an unregistered child leaves the
 * outbox parchment untouched and a known count prevents a second synchronous reading of oil.
 */
proveUnregisteredSkipsOutbox();
proveKnownCountSkipsRescan();
proveLostAcknowledgementSettlement();
console.log("BHY settlement retries durable truth without redundant outbox scans");

function proveUnregisteredSkipsOutbox() {
	let scans = 0;
	const pulse = SettlementPulse.create({
		delivery: {
			flush() {
				return 0;
			}
		},
		mailbox: createCountingMailbox(() => {
			scans += 1;
			return [
				{
					id: "forbidden-scan"
				}
			];
		}),
		state: {
			registrationConfirmed: false
		},
		now: () => 1000
	});
	const witness = pulse.tick();
	assert.equal(witness.reason, "not_registered");
	assert.equal(scans, 0);
}

function proveKnownCountSkipsRescan() {
	let scans = 0;
	const pulse = SettlementPulse.create({
		delivery: {
			flush() {
				return 1;
			}
		},
		mailbox: createCountingMailbox(() => {
			scans += 1;
			return [
				{
					id: "unexpected-rescan"
				}
			];
		}),
		state: {
			registrationConfirmed: true
		},
		now: () => 1000,
		initialRetryMs: 250
	});
	assert.equal(pulse.tick(1).reason, "settlement_grace");
	assert.equal(scans, 0);
}

function proveLostAcknowledgementSettlement() {
	let time = 1000;
	let flushes = 0;
	const outbox = [
		{
			id: "terminal-A",
			type: "TUNNEL_RESPONSE"
		}
	];
	const pulse = SettlementPulse.create({
		delivery: {
			flush() {
				flushes += 1;
				return outbox.length;
			}
		},
		mailbox: createCountingMailbox(() => outbox.slice()),
		state: {
			registrationConfirmed: true
		},
		now: () => time,
		initialRetryMs: 250,
		maxRetryMs: 1000
	});
	assert.equal(pulse.tick(1).reason, "settlement_grace");
	time = 1249;
	assert.equal(pulse.tick(1).reason, "settlement_cooldown");
	time = 1250;
	let witness = pulse.tick(1);
	assert.equal(witness.reason, "terminal_retransmitted");
	assert.equal(witness.attempts, 1);
	assert.equal(flushes, 1);
	time = 1750;
	witness = pulse.tick(1);
	assert.equal(witness.attempts, 2);
	assert.equal(flushes, 2);
	outbox.length = 0;
	witness = pulse.tick(0);
	assert.equal(witness.reason, "outbox_empty");
	assert.equal(witness.attempts, 0);
}

function createCountingMailbox(readOutbox) {
	return {
		outbox() {
			return readOutbox();
		}
	};
}
