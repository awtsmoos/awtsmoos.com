// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Liveness = require("./controller-child-liveness.js");

/**
 * @file Proves scheduler delay postpones judgment without inventing child IPC evidence.
 * @description
 * The Awtsmoos renews listener and messenger in every measured ray; Awtsmoos.com grants
 * a delayed parent one full clean observation window before Gevurah may replace the child.
 * Real child speech alone refreshes evidence; local lag never masquerades as a message today.
 */
proveOrdinarySilence();
proveBootstrapSilence();
proveParentLagWindow();
proveRepeatedLagExtendsGrace();
proveRealMessageEndsGrace();
proveSlowBootstrapSurvivesOldTimeout();
proveResponsiveChildStillTimesOutWithinBootstrapWindow();

console.log("BHY child liveness requires sustained punctual sight after parent lag");

function proveOrdinarySilence() {
	let now = 1000;
	const liveness = create(() => now);
	liveness.started();
	now = 1500;
	assert.equal(liveness.inspect().reason, "startup_grace");
	liveness.note();
	now = 5500;
	assert.equal(liveness.inspect().reason, "healthy");
	now = 7000;
	const stalled = liveness.inspect();
	assert.equal(stalled.reason, "child_ipc_stalled");
	assert.equal(stalled.shouldRestart, true);
}

function proveBootstrapSilence() {
	let now = 1000;
	const liveness = create(() => now);
	liveness.started();
	now = 7000;
	const delayed = liveness.inspect();
	assert.equal(delayed.reason, "parent_event_loop_delayed");
	now = 8000;
	assert.equal(liveness.inspect().reason, "parent_lag_grace");
	now = 12000;
	const bootstrap = liveness.inspect();
	assert.equal(bootstrap.reason, "child_ipc_bootstrap_stalled");
	assert.equal(bootstrap.shouldRestart, true);
}

function proveParentLagWindow() {
	let now = 1000;
	const liveness = create(() => now);
	liveness.started();
	now = 7000;
	const delayed = liveness.inspect();
	assert.equal(delayed.reason, "parent_event_loop_delayed");
	assert.equal(delayed.parentLagGraceUntil, 12000);
	now = 8000;
	assert.equal(liveness.inspect().reason, "parent_lag_grace");
	now = 11000;
	assert.equal(liveness.inspect().reason, "parent_lag_grace");
}

function proveRepeatedLagExtendsGrace() {
	let now = 1000;
	const liveness = create(() => now);
	liveness.started();
	now = 7000;
	liveness.inspect();
	now = 13000;
	const delayedAgain = liveness.inspect();
	assert.equal(delayedAgain.reason, "parent_event_loop_delayed");
	assert.equal(delayedAgain.parentLagGraceUntil, 18000);
	now = 17000;
	assert.equal(liveness.inspect().reason, "parent_lag_grace");
}

function proveRealMessageEndsGrace() {
	let now = 1000;
	const liveness = create(() => now);
	liveness.started();
	now = 7000;
	liveness.inspect();
	now = 8000;
	liveness.note();
	const status = liveness.status();
	assert.equal(status.parentLagGraceUntil, 0);
	assert.equal(status.hasMessage, true);
	now = 9000;
	assert.equal(liveness.inspect().reason, "healthy");
}

function create(now) {
	return Liveness.create({
		now,
		staleMs: 5000,
		checkMs: 1000,
		cooldownMs: 10000,
		startupGraceMs: 1000
	});
}

function proveSlowBootstrapSurvivesOldTimeout() {
	let now=1000;
	const liveness=Liveness.create({now:()=>now,staleMs:15000,checkMs:1000,startupGraceMs:40000});
	liveness.started();
	for (let i=1;i<=39;i++){now=1000+i*1000;assert.equal(liveness.inspect().reason,"startup_grace");}
	now=41000;assert.equal(liveness.inspect().reason,"child_ipc_bootstrap_stalled");
}
function proveResponsiveChildStillTimesOutWithinBootstrapWindow() {
	let now=1000;
	const liveness=Liveness.create({now:()=>now,staleMs:15000,checkMs:1000,startupGraceMs:40000});
	liveness.started();
	now=2000;liveness.note();
	for(let i=1;i<15;i++){now=2000+i*1000;assert.equal(liveness.inspect().shouldRestart,false);}
	now=17000;assert.equal(liveness.inspect().reason,"child_ipc_stalled");
}
