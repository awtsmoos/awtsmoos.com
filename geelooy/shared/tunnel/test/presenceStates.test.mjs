// B"H
// Boruch Hashem
// Blessed is He

import assert from "assert";
import { normalizeTunnelPresence, TUNNEL_PRESENCE_STATES } from "../presenceStates.js";

const cases = [
	[{ enabled: false, state: "idle" }, TUNNEL_PRESENCE_STATES.DISABLED],
	[{ enabled: true, state: "connecting" }, TUNNEL_PRESENCE_STATES.CONNECTING],
	[{ connected: true }, TUNNEL_PRESENCE_STATES.ONLINE],
	[{ readyState: 1 }, TUNNEL_PRESENCE_STATES.ONLINE],
	[{ state: "reconnecting" }, TUNNEL_PRESENCE_STATES.RECONNECTING],
	[{ reconnectAttempt: 2 }, TUNNEL_PRESENCE_STATES.RECONNECTING],
	[{ state: "degraded" }, TUNNEL_PRESENCE_STATES.DEGRADED],
	[{ readyState: 3 }, TUNNEL_PRESENCE_STATES.OFFLINE],
	[{ error: "socket exploded" }, TUNNEL_PRESENCE_STATES.FAILED],
	[{}, TUNNEL_PRESENCE_STATES.UNKNOWN]
];

for (const [input, expected] of cases) {
	const presence = normalizeTunnelPresence(input);
	assert.strictEqual(presence.state, expected);
	assert(presence.label);
	assert(presence.tone);
	assert(presence.detail);
}

const failure = normalizeTunnelPresence({
	error: "specific_failure"
});
assert.strictEqual(failure.detail, "specific_failure");
assert(Object.isFrozen(failure));
console.log("BHY shared tunnel presence tests passed");
