// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Liveness = require("../lib/ws/transportLiveness.js");

/**
	* @file Reproduces the observed 33.265-second event-loop stall.
	* @description
	* The Awtsmoos separates suspended local time from remote silence. Awtsmoos.com
	* recovers the socket after the exact historical stall, yet still kills a truly
	* half-open path after a fresh uninterrupted silence window.
	*/
function main() {
	provesObservedStallCannotDropTunnel();
	provesContinuousSilenceStillDies();
	console.log(JSON.stringify({
		ok: true,
		suite: "transport-liveness-event-loop-lag",
		observedStallMs: 33265,
		falseDropPrevented: true,
		continuousSilenceExpires: true
	}, null, 2));
}

function provesObservedStallCannotDropTunnel() {
	let clock = 0;
	const pings = [];
	const deaths = [];
	const lags = [];
	const liveness = create(clock, pings, deaths, lags);
	for (clock of [15000, 30000, 45000]) {
		assert.notEqual(liveness.tick(clock).state, "dead");
	}
	clock = 93265;
	const wake = liveness.tick(clock);
	assert.equal(wake.state, "lagged");
	assert.equal(wake.timerDriftMs, 33265);
	assert.equal(deaths.length, 0);
	assert.equal(lags.length, 1);
	assert.equal(pings.at(-1).reason, "timer_drift");
	assert.equal(liveness.snapshot().lastInboundAt, 93265);
	assert.equal(liveness.snapshot().recoveryCount, 1);
	for (clock of [108265, 123265, 138265, 153265]) {
		assert.notEqual(liveness.tick(clock).state, "dead");
	}
	clock = 168265;
	assert.equal(liveness.tick(clock).state, "dead");
	assert.equal(deaths.length, 1);
}

function provesContinuousSilenceStillDies() {
	let clock = 0;
	const deaths = [];
	const liveness = create(clock, [], deaths, []);
	for (clock of [15000, 30000, 45000, 60000]) {
		assert.notEqual(liveness.tick(clock).state, "dead");
	}
	clock = 75000;
	assert.equal(liveness.tick(clock).state, "dead");
	assert.equal(deaths.length, 1);
}

function create(clock, pings, deaths, lags) {
	return Liveness.createTransportLiveness({
		now: () => clock,
		intervalMs: 15000,
		pingIdleMs: 20000,
		deadIdleMs: 75000,
		maxTimerDriftMs: 2000,
		onPing: details => pings.push(details),
		onDead: details => deaths.push(details),
		onLag: details => lags.push(details)
	});
}

main();
