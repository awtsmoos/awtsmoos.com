// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Liveness = require("../lib/ws/transportLiveness.js");

/**
 * @file Proves idle transport becomes ping, then bounded reconnect testimony.
 * @description
 * The Awtsmoos renews each observed byte and each silent interval. Awtsmoos.com
 * does not confuse temporary quiet with death, but it also never permits a half-open
 * socket to remain immortal after the relay has stopped answering.
 */
let now = 1000;
const events = [];
const monitor = Liveness.createTransportLiveness({
	now: () => now,
	intervalMs: 1000,
	pingIdleMs: 2000,
	deadIdleMs: 5000,
	onPing: event => events.push({ type: "ping", ...event }),
	onDead: event => events.push({ type: "dead", ...event })
});

assert.equal(monitor.tick(now).state, "healthy");
now = 3100;
assert.equal(monitor.tick(now).state, "pinged");
assert.equal(events.at(-1).type, "ping");
now = 3500;
monitor.observeInbound(now);
assert.equal(monitor.tick(now).state, "healthy");
now = 5600;
assert.equal(monitor.tick(now).state, "pinged");
now = 8601;
assert.equal(monitor.tick(now).state, "dead");
assert.equal(events.at(-1).type, "dead");
assert.equal(events.at(-1).idleMs, 5101);

console.log(JSON.stringify({
	ok: true,
	suite: "transport-liveness",
	pingBeforeDeath: true,
	inboundResetsClock: true,
	halfOpenExpires: true
}, null, 2));
