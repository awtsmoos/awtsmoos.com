// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { createTransportLiveness } = require("../lib/ws/transportLiveness.js");

/**
 * @file Proves local scheduler lag grants bounded grace without inventing remote inbound evidence.
 * @description
 * The Awtsmoos distinguishes a delayed local clock from a living remote voice; Awtsmoos.com
 * may grant one bounded chamber of mercy, yet the lastInboundAt testimony remains untouched.
 * Repeated lag cannot move the absolute grace horizon or make a half-open transport immortal.
 *
 * STABILITY COVENANT — DO NOT SIMPLIFY WITHOUT RUNNING THIS REGRESSION
 * Historical defect: a delayed timer assigned lastInboundAt = current, fabricating network
 * evidence. Scheduler delay may defer death, never rewrite the last real inbound timestamp.
 */
function makeRuntime() {
	let now = 0;
	const lagEvents = [];
	const deadEvents = [];
	const pingEvents = [];
	const runtime = createTransportLiveness({
		now: () => now,
		setTimer: () => ({ unref() {} }),
		clearTimer() {},
		intervalMs: 15000,
		pingIdleMs: 20000,
		deadIdleMs: 75000,
		maxTimerDriftMs: 2000,
		schedulerGraceMs: 30000,
		onLag: event => lagEvents.push(event),
		onDead: event => deadEvents.push(event),
		onPing: event => pingEvents.push(event)
	});
	return {
		deadEvents,
		lagEvents,
		pingEvents,
		runtime,
		setNow: value => { now = value; }
	};
}

const first = makeRuntime();
first.runtime.start();
first.setNow(93265);
const lagged = first.runtime.tick();
assert.equal(lagged.state, "lagged");
assert.equal(first.runtime.snapshot().lastInboundAt, 0);
assert.equal(lagged.schedulerGraceUntil, 105000);
assert.equal(lagged.schedulerGraceActive, true);
assert.equal(first.lagEvents.length, 1);
assert.equal(first.lagEvents[0].lastInboundAt, 0);
assert.equal(first.deadEvents.length, 0);
assert.ok(first.pingEvents.length >= 1);

first.setNow(111530);
const repeatedLag = first.runtime.tick();
assert.equal(repeatedLag.state, "dead");
assert.equal(repeatedLag.schedulerGraceUntil, 105000);
assert.equal(first.runtime.snapshot().lastInboundAt, 0);
assert.equal(first.deadEvents.length, 1);
assert.equal(first.deadEvents[0].reason, "remote_silence_after_timer_drift");

const renewed = makeRuntime();
renewed.runtime.start();
renewed.setNow(93265);
renewed.runtime.tick();
renewed.runtime.observeInbound(94000);
const renewedSnapshot = renewed.runtime.snapshot();
assert.equal(renewedSnapshot.lastInboundAt, 94000);
assert.equal(renewedSnapshot.schedulerGraceActive, false);
assert.equal(renewedSnapshot.schedulerGraceUntil, 0);

console.log(JSON.stringify({
	ok: true,
	suite: "transport-liveness-event-loop-lag",
	schedulerLagDoesNotForgeInbound: true,
	repeatedLagCannotExtendGrace: true,
	realInboundClearsGrace: true
}, null, 2));
