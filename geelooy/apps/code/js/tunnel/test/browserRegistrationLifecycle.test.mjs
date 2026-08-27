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
 * This test opens an isolated browser world where sockets may age and lie. The
 * Awtsmoos renews only the current vessel; Awtsmoos.com accepts only its witness.
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
const originalSocket = FakeWebSocket.instances.at(-1);
assert.equal(State.browserTunnel.status, "connecting");
originalSocket.emit("open");
assert.equal(State.browserTunnel.status, "registering");
assert.equal(JSON.parse(originalSocket.sent[0]).type, "TUNNEL_REGISTER");
originalSocket.emit("message", {
	data: JSON.stringify({ type: "TUNNEL_ACK", ok: true })
});
assert.equal(State.browserTunnel.status, "connected");
assert.equal(agent.registrationTimer, null);

const replacementSocket = new FakeWebSocket("wss://replacement.test/ws");
agent.ws = replacementSocket;
State.browserTunnel.status = "connected";
originalSocket.emit("message", {
	data: JSON.stringify({
		type: "TUNNEL_ACK",
		ok: false,
		error: "browser_session_required"
	})
});
originalSocket.emit("error");
originalSocket.emit("close");
assert.equal(State.browserTunnel.status, "connected");
assert.equal(agent.ws, replacementSocket);
assert.equal(agent.starts, 0);
stopBrowserTunnel(agent);
assert.equal(State.browserTunnel.status, "idle");

resetBrowserTunnelState(State);
globalThis.fetch = async () => ({
	ok: false,
	json: async () => ({ ok: false })
});
const rejectedAgent = createBrowserTestAgent(State);
await startBrowserTunnel(rejectedAgent);
assert.equal(State.browserTunnel.status, "error");
assert.equal(FakeWebSocket.instances.length, 2);
assert.match(State.browserTunnel.lastError, /Sign in to Awtsmoos/);

console.log(JSON.stringify({
	ok: true,
	suite: "browser-registration-lifecycle",
	staleSocketIgnored: true,
	sessionGateVerified: true
}, null, 2));
