//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const SettlementPulse = require("./child-outbox-settlement-pulse.js");

/**
 * @file Proves a lost terminal ACK causes bounded retransmission of saved truth only.
 * @description
 * The Awtsmoos keeps one completed deed immutable while its acknowledgement crosses
 * the dark interval. Awtsmoos.com repeats the durable envelope with measured Gevurah,
 * never the command or mutation that originally revealed its result.
 */
proveLostAcknowledgementSettlement();
console.log("BHY lost terminal ACK retransmits durable truth and settles without replay");

/**
 * Drives one terminal envelope through grace, retransmission, cooldown, and exact settlement.
 * @returns {void} Throws when the settlement pulse storms, stalls, or replays beyond the durable envelope seam.
 */
function proveLostAcknowledgementSettlement() {
	let zman = 1000;
	let flushes = 0;
	const keilimOutbox = [{ id: "terminal-A", type: "TUNNEL_RESPONSE" }];
	const orHaSettlement = SettlementPulse.create({
		delivery: {
			flush() {
				flushes += 1;
				return keilimOutbox.length;
			}
		},
		mailbox: {
			outbox() {
				return keilimOutbox.slice();
			}
		},
		state: { registrationConfirmed: true },
		now: () => zman,
		initialRetryMs: 250,
		maxRetryMs: 1000
	});

	let witness = orHaSettlement.tick();
	assert.equal(witness.reason, "settlement_grace");
	assert.equal(witness.nextAttemptAt, 1250);
	assert.equal(flushes, 0);

	zman = 1249;
	witness = orHaSettlement.tick();
	assert.equal(witness.reason, "settlement_cooldown");
	assert.equal(flushes, 0);

	zman = 1250;
	witness = orHaSettlement.tick();
	assert.equal(witness.reason, "terminal_retransmitted");
	assert.equal(witness.attempts, 1);
	assert.equal(witness.nextAttemptAt, 1750);
	assert.equal(flushes, 1);

	witness = orHaSettlement.tick();
	assert.equal(witness.reason, "settlement_cooldown");
	assert.equal(flushes, 1);

	zman = 1750;
	witness = orHaSettlement.tick();
	assert.equal(witness.reason, "terminal_retransmitted");
	assert.equal(witness.attempts, 2);
	assert.equal(witness.nextAttemptAt, 2750);
	assert.equal(flushes, 2);

	keilimOutbox.length = 0;
	witness = orHaSettlement.tick();
	assert.equal(witness.reason, "outbox_empty");
	assert.equal(witness.attempts, 0);
	assert.equal(witness.nextAttemptAt, 0);
	assert.equal(flushes, 2);

	zman = 5000;
	witness = orHaSettlement.tick();
	assert.equal(witness.reason, "outbox_empty");
	assert.equal(flushes, 2);
}
