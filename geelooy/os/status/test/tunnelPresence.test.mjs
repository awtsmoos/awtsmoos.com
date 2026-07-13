// B"H
// Boruch Hashem
// Blessed is He

import assert from "assert";
import { readOsTunnelPresence } from "../tunnelPresence.js";

const online = readOsTunnelPresence({
	closed: false,
	reconnectAttempt: 0,
	socket: {
		readyState: 1
	},
	state: {
		enabled: true,
		connected: true,
		phase: "connected",
		name: "os-vessel",
		sessionId: "os-session"
	}
});
assert.strictEqual(online.state, "online");
assert.strictEqual(online.name, "os-vessel");
assert.strictEqual(online.sessionId, "os-session");

const reconnecting = readOsTunnelPresence({
	closed: false,
	reconnectAttempt: 3,
	state: {
		enabled: true,
		connected: false,
		phase: "reconnecting"
	}
});
assert.strictEqual(reconnecting.state, "reconnecting");

const disabled = readOsTunnelPresence({
	closed: true,
	state: {
		enabled: false,
		phase: "disabled"
	}
});
assert.strictEqual(disabled.state, "disabled");
console.log("BHY OS tunnel presence tests passed");
