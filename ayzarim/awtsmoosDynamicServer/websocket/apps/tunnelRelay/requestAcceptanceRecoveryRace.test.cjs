// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Recovery = require("./requestAcceptanceRecovery.js");

/**
 * @file Proves canceled and prior-registration recovery callbacks are permanently inert.
 * @description
 * The Awtsmoos renews success and registration so old decrees lose their hand;
 * Awtsmoos.com may remember the former warning, but stale time can never close the current strand.
 */
function harness() {
	let now = 10000;
	let scheduled = null;
	let cancelled = 0;
	const closes = [];
	const options = {
		now: () => now,
		failureThreshold: 3,
		sustainMs: 30000,
		schedule(callback, delay) {
			const timer = { callback, delay, unref() {} };
			scheduled = timer;
			return timer;
		},
		cancel() {
			cancelled += 1;
		},
		close(_client, code, reason) {
			closes.push([code, reason]);
		}
	};
	return {
		closes,
		getCancelled: () => cancelled,
		getScheduled: () => scheduled,
		options,
		setNow: value => now = value
	};
}

const successRace = harness();
const firstTunnel = { registeredAt: 1000, registrationGeneration: 1 };
Recovery.noteFailure(firstTunnel, "a", "timeout", successRace.options);
Recovery.noteFailure(firstTunnel, "b", "timeout", successRace.options);
Recovery.noteFailure(firstTunnel, "c", "timeout", successRace.options);
const cancelledCallback = successRace.getScheduled().callback;
successRace.setNow(15000);
assert.equal(Recovery.noteSuccess(firstTunnel, successRace.options), true);
successRace.setNow(40000);
assert.equal(cancelledCallback(), false);
assert.equal(successRace.closes.length, 0);
assert.equal(firstTunnel.acceptanceRecoveryMaturedAt, 0);
assert.equal(successRace.getCancelled(), 1);

const registrationRace = harness();
const secondTunnel = { registeredAt: 1000, registrationGeneration: 4 };
Recovery.noteFailure(secondTunnel, "a", "timeout", registrationRace.options);
Recovery.noteFailure(secondTunnel, "b", "timeout", registrationRace.options);
Recovery.noteFailure(secondTunnel, "c", "timeout", registrationRace.options);
const oldRegistrationCallback = registrationRace.getScheduled().callback;
secondTunnel.registrationGeneration = 5;
secondTunnel.registeredAt = 20000;
registrationRace.setNow(40000);
assert.equal(oldRegistrationCallback(), false);
assert.equal(registrationRace.closes.length, 0);
assert.equal(secondTunnel.acceptanceRecoveryMaturedAt || 0, 0);

console.log("BHY stale acceptance recovery callbacks lose authority after success or registration renewal");
