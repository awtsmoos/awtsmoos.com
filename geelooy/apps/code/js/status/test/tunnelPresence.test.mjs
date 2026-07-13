// B"H
// Boruch Hashem
// Blessed is He

import assert from "assert";
import { formatCodeTunnelPresence, readCodeTunnelPresence } from "../tunnelPresence.js";

const online = readCodeTunnelPresence({
	status: "connected",
	settings: {
		name: "code-vessel"
	}
});
assert.strictEqual(online.state, "online");
assert.strictEqual(online.name, "code-vessel");
assert.strictEqual(formatCodeTunnelPresence(online), "Tunnel: Online");

const disabled = readCodeTunnelPresence({
	status: "idle",
	socket: null
});
assert.strictEqual(disabled.state, "disabled");

const retrying = readCodeTunnelPresence({
	status: "reconnecting",
	reconnectAttempt: 2
});
assert.strictEqual(retrying.state, "reconnecting");

const failed = readCodeTunnelPresence({
	status: "error",
	lastError: "browser_socket_failed"
});
assert.strictEqual(failed.state, "failed");
assert.strictEqual(failed.detail, "browser_socket_failed");
console.log("BHY Apps Code tunnel presence tests passed");
