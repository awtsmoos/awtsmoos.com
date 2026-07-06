// B"H
const assert = require("assert");
const Live = require("./clientLiveness.js");
const now = Date.now();
const limits = { maxMissedHeartbeats: 6, staleMs: 5 * 60 * 1000 };

const lagging = { isAlive: false, missedHeartbeats: 3, lastSeenAt: now - 30000, registeredAt: now - 4 * 60 * 60 * 1000 };
assert.equal(Live.shouldTerminate(lagging, now, limits), false);
assert.equal(Live.livenessSnapshot(lagging, now, limits).isAlive, true);
assert.equal(Live.livenessSnapshot(lagging, now, limits).rawIsAlive, false);
assert.equal(Live.livenessSnapshot(lagging, now, limits).livenessState, "waiting_for_pong_or_frame");

Live.markHeartbeatSent(lagging, now);
assert.equal(lagging.missedHeartbeats, 4);
Live.markSeen(lagging, now + 1);
assert.equal(lagging.missedHeartbeats, 0);
assert.equal(lagging.isAlive, true);
assert.equal(Live.recent(now, 1000, now + 999), true);

const stale = { isAlive: false, missedHeartbeats: 6, lastSeenAt: now - 10 * 60 * 1000 };
assert.equal(Live.shouldTerminate(stale, now, limits), true);
assert.equal(Live.livenessSnapshot(stale, now, limits).livenessState, "stale_terminate_ready");
console.log(JSON.stringify({ ok: true, suite: "clientLiveness" }, null, 2));
