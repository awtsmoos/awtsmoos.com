//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Repair = require("./parent-watchdog-repair.js");

/**
 * @file Proves delayed escalation cannot cross into a reused PID or survive fresh-health clear.
 * @description
 * The Awtsmoos renews each process life even when the shell repeats one numeric name;
 * Awtsmoos.com rechecks birth and generation before SIGKILL may follow SIGTERM's flame.
 * If identity changes or health returns, the timer loses every destructive claim.
 */
const identity = {
	parentPid: 4321,
	generation: 7,
	processGroupId: 4321,
	birthToken: "parent-birth-a",
	platform: "darwin"
};

provePidReuseCancelsEscalation();
proveClearCancelsEscalation();
console.log("BHY parent watchdog escalation cannot cross identity reuse or fresh recovery");

/** Proves same numeric PID with a changed birth witness never receives delayed SIGKILL. */
function provePidReuseCancelsEscalation() {
	const signals = [];
	const lifecycle = [];
	let timerCallback = null;
	let matchCalls = 0;
	const repair = Repair.create({
		parentPid: identity.parentPid,
		identity: {
			current: () => ({ ...identity }),
			matches() {
				matchCalls += 1;
				return matchCalls === 1;
			}
		},
		signalParent(pid, signal) {
			signals.push([pid, signal]);
			return true;
		},
		recordLifecycle(event, details) {
			lifecycle.push({ event, details });
		},
		setTimer(callback) {
			timerCallback = callback;
			return { unref() {} };
		}
	});
	assert.equal(repair.request("execution_consumer_stalled", {
		allowed: true,
		identity: { ...identity }
	}), true);
	assert.deepEqual(signals, [[4321, "SIGTERM"]]);
	timerCallback();
	assert.deepEqual(signals, [[4321, "SIGTERM"]]);
	assert.equal(repair.snapshot().repairing, false);
	assert.equal(lifecycle.at(-1).event, "watchdog_signal_cancelled");
	assert.equal(lifecycle.at(-1).details.cancellationReason, "identity_changed");
}

/** Proves fresh-health clear cancels a scheduled escalation before its callback can act. */
function proveClearCancelsEscalation() {
	const signals = [];
	let timerCallback = null;
	let timerToken = null;
	let clearedToken = null;
	const repair = Repair.create({
		parentPid: identity.parentPid,
		identity: {
			current: () => ({ ...identity }),
			matches: () => true
		},
		signalParent(pid, signal) {
			signals.push([pid, signal]);
			return true;
		},
		setTimer(callback) {
			timerCallback = callback;
			timerToken = { unref() {} };
			return timerToken;
		},
		clearTimer(token) {
			clearedToken = token;
		}
	});
	assert.equal(repair.request("execution_consumer_stalled", {
		allowed: true,
		identity: { ...identity }
	}), true);
	repair.clear();
	assert.equal(clearedToken, timerToken);
	assert.equal(repair.snapshot().repairing, false);
	timerCallback();
	assert.deepEqual(signals, [[4321, "SIGTERM"]]);
}
