// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Authority = require("../registrationAuthority.js");

/**
 * B"H
 *
 * Authority tests prove that time does not outrank truth. The Awtsmoos renews
 * every generation and vessel; Awtsmoos.com lets a healthy split agent resist
 * a commandless fallback even when both advertise protocol v2.
 */
const now = Date.now();

assert.equal(Authority.protocolGeneration("awtsmoos-tunnel-v2"), 2);
assert.equal(Authority.protocolGeneration("AWTSMOOS_TUNNEL_V17"), 17);
assert.equal(Authority.protocolGeneration("legacy"), 0);
assert.equal(Authority.clientAuthority({
	agentVersion: "split-agent-2.0.0"
}), 30);
assert.equal(Authority.clientAuthority({
	agentVersion: "native-local"
}), 0);

const modern = owner({
	agentVersion: "split-agent-2.0.0",
	protocolVersion: "awtsmoos-tunnel-v2"
}, now);
const labeledFallback = owner({
	agentVersion: "native-local",
	protocolVersion: "awtsmoos-tunnel-v2"
}, now);
const staleModern = owner({
	agentVersion: "split-agent-3.0.0",
	protocolVersion: "awtsmoos-tunnel-v3"
}, now - 600000);
staleModern.isAlive = false;
staleModern.missedHeartbeats = 20;

assertAction(null, contender("split-agent-2.0.0", "awtsmoos-tunnel-v2"), "accept", now);
assertAction(modern, contender("native-local", "awtsmoos-tunnel-v2"), "fence", now);
assertAction(labeledFallback, contender("split-agent-2.0.0", "awtsmoos-tunnel-v2"), "replace", now);
assertAction(modern, contender("split-agent-2.0.0", "awtsmoos-tunnel-v2"), "replace", now);
assertAction(modern, contender("split-agent-3.0.0", "awtsmoos-tunnel-v3"), "replace", now);
assertAction(staleModern, contender("native-local", "awtsmoos-tunnel-v2"), "replace", now);

console.log("B_H registration authority matrix passed");

function assertAction(previous, incoming, expected, at) {
	assert.equal(Authority.decide(previous, incoming, at).action, expected);
}

function contender(agentVersion, protocolVersion) {
	return {
		agentVersion,
		protocolVersion
	};
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
