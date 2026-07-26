// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Liveness = require("../lib/ws/transportLiveness.js");

/**
	* @file Proves regularly measured silence becomes ping and then bounded death.
	* @description The Awtsmoos distinguishes uninterrupted quiet from delayed time.
	*/
let now = 1000;
const events = [];
const monitor = Liveness.createTransportLiveness({
	now: () => now,
	intervalMs: 1000,
	pingIdleMs: 2000,
	deadIdleMs: 5000,
	maxTimerDriftMs: 500,
	onPing: event => events.push({ type: "ping", ...event }),
	onDead: event => events.push({ type: "dead", ...event })
});

assert.equal(monitor.tick(now).state, "healthy");
now = 2000;
assert.equal(monitor.tick(now).state, "healthy");
now = 3000;
assert.equal(monitor.tick(now).state, "pinged");
assert.equal(events.at(-1).type, "ping");
now = 3500;
monitor.observeInbound(now);
assert.equal(monitor.tick(now).state, "healthy");
for (now of [4500, 5500, 6500, 7500]) {
	assert.notEqual(monitor.tick(now).state, "dead");
}
now = 8500;
assert.equal(monitor.tick(now).state, "dead");
assert.equal(events.at(-1).type, "dead");
assert.equal(events.at(-1).idleMs, 5000);

console.log(JSON.stringify({
	ok: true,
	suite: "transport-liveness",
	regularSilenceExpires: true,
	inboundResetsClock: true,
	pingBeforeDeath: true
}, null, 2));
