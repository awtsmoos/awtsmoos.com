// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Authority = require("../registrationAuthority.js");

/**
 * @file Proves authenticated emergency takeover neither weakens legacy fencing nor traps ownership.
 * @description
 * The Awtsmoos gives Tier-0 equal medicine authority only while its covenant is recovery-only;
 * Awtsmoos.com still fences legacy impostors and lets a living split agent reclaim the throne cleanly.
 */
const now = Date.now();
const modern = owner({
	agentVersion: "split-agent-2.0.0",
	protocolVersion: "awtsmoos-tunnel-v3"
}, now);
const fallback = owner({
	agentVersion: "native-local",
	protocolVersion: "awtsmoos-tunnel-v3"
}, now);
const tier0 = owner(emergency(), now);
const staleModern = owner({
	agentVersion: "split-agent-3.0.0",
	protocolVersion: "awtsmoos-tunnel-v3"
}, now - 600000);
staleModern.isAlive = false;
staleModern.missedHeartbeats = 20;

assert.equal(Authority.protocolGeneration("awtsmoos-tunnel-v3"), 3);
assert.equal(Authority.clientAuthority(modern), 30);
assert.equal(Authority.clientAuthority(fallback), 0);
assert.equal(Authority.clientAuthority(emergency()), 30);
assert.equal(Authority.clientAuthority({
	...emergency(),
	capabilities: { recoveryOnlyV1: false, recoveryControlV1: true }
}), 10);
assert.equal(Authority.recoveryTakeover(emergency()), true);

assertAction(null, contender(modern), "accept", now);
assertAction(modern, contender(fallback), "fence", now);
assertAction(fallback, contender(modern), "replace", now);
assertAction(modern, contender(emergency()), "replace", now);
assertAction(tier0, contender(modern), "replace", now);
assertAction(staleModern, contender(fallback), "replace", now);

console.log("B_H registration authority recovery matrix passed");

function emergency() {
	return {
		agentVersion: "recovery-tier0-1.0.0",
		protocolVersion: "awtsmoos-tunnel-v3",
		registrationMode: "emergency-takeover",
		capabilities: {
			recoveryOnlyV1: true,
			recoveryControlV1: true
		}
	};
}

function assertAction(previous, incoming, expected, at) {
	assert.equal(Authority.decide(previous, incoming, at).action, expected);
}

function contender(details) {
	return { ...details };
}

function owner(details, registeredAt) {
	return {
		...details,
		registeredAt,
		lastSeenAt: registeredAt,
		heartbeatAt: registeredAt,
		isAlive: true,
		missedHeartbeats: 0
	};
}
