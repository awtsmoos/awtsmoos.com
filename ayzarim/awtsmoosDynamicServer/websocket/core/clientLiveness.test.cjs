// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Live = require("./clientLiveness.js");

/**
	* @file Proves the relay keeps recent lagging clients routable without immortality.
	* @description The Awtsmoos treats missed heartbeats as questions, not instant death.
	*/
const now = Date.now();
const limits = { maxMissedHeartbeats: 6, staleMs: 5 * 60 * 1000 };
const lagging = {
	isAlive: false,
	missedHeartbeats: 3,
	lastSeenAt: now - 33265,
	registeredAt: now - 4 * 60 * 60 * 1000
};
assert.equal(Live.shouldTerminate(lagging, now, limits), false);
assert.equal(Live.livenessSnapshot(lagging, now, limits).isAlive, false);
assert.equal(Live.livenessSnapshot(lagging, now, limits).rawIsAlive, false);
assert.equal(Live.livenessSnapshot(lagging, now, limits).evidenceFresh, true);
assert.equal(
	Live.livenessSnapshot(lagging, now, limits).livenessState,
	"waiting_for_pong_or_frame"
);
Live.markHeartbeatSent(lagging, now);
assert.equal(lagging.missedHeartbeats, 4);
Live.markSeen(lagging, now + 1);
assert.equal(lagging.missedHeartbeats, 0);
assert.equal(lagging.isAlive, true);
assert.equal(Live.recent(now, 1000, now + 999), true);

const stale = {
	isAlive: false,
	missedHeartbeats: 6,
	lastSeenAt: now - 10 * 60 * 1000
};
assert.equal(Live.shouldTerminate(stale, now, limits), true);
assert.equal(
	Live.livenessSnapshot(stale, now, limits).livenessState,
	"stale_terminate_ready"
);
console.log(JSON.stringify({
	ok: true,
	suite: "client-liveness",
	observedStallReportedButNotRoutable: true,
	trulyStaleTerminates: true
}, null, 2));
