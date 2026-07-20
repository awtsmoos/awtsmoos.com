// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	createBrowserTestAgent,
	resetBrowserTunnelState
} from "./browser-test-agent.mjs";
import {
	FakeWebSocket,
	createToastContainer,
	installBrowserTestEnvironment
} from "./browser-test-environment.mjs";

/**
 * B"H
 * A rejected acknowledgement must never masquerade as connection. The Awtsmoos
 * renews truth through the relay witness; Awtsmoos.com preserves the exact error
 * while closing the rejected vessel and preparing a bounded future attempt.
 */
installBrowserTestEnvironment();
const { State, DOM } = await import("../../state.js");
DOM.toastContainer = createToastContainer();
const { startBrowserTunnel, stopBrowserTunnel } = await import(
	"../browser-agent-connection.js"
);
const { handleBrowserTunnelRegistrationAck } = await import(
	"../browser-agent-registration.js"
);

resetBrowserTunnelState(State);
globalThis.fetch = async () => ({
	ok: true,
	json: async () => ({ ok: true, identity: { accountId: "isolated" } })
});
const agent = createBrowserTestAgent(
	State,
	handleBrowserTunnelRegistrationAck
);
await startBrowserTunnel(agent);
const socket = FakeWebSocket.instances.at(-1);
socket.emit("open");
assert.equal(State.browserTunnel.status, "registering");
socket.emit("message", {
	data: JSON.stringify({
		type: "TUNNEL_ACK",
		ok: false,
		error: "browser_session_required"
	})
});

assert.equal(socket.closed, true);
assert.notEqual(State.browserTunnel.status, "connected");
assert.equal(State.browserTunnel.status, "reconnecting");
assert.match(State.browserTunnel.lastError, /browser_session_required/);
assert.equal(agent.registrationTimer, null);
assert.equal(DOM.toastContainer.children.length, 1);
stopBrowserTunnel(agent);

console.log(JSON.stringify({
	ok: true,
	suite: "browser-registration-rejection-lifecycle",
	rejectionNeverConnected: true,
	preciseErrorPreserved: true
}, null, 2));
