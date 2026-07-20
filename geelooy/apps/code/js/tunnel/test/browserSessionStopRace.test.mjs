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
 * A delayed session witness must not reopen a tunnel after the user has stopped
 * it. The Awtsmoos renews intention each instant; Awtsmoos.com honors the newest
 * intention instead of allowing an older promise to resurrect a closed vessel.
 */
installBrowserTestEnvironment();
const { State, DOM } = await import("../../state.js");
DOM.toastContainer = createToastContainer();
const { startBrowserTunnel, stopBrowserTunnel } = await import(
	"../browser-agent-connection.js"
);

resetBrowserTunnelState(State);
let resolveSession;
globalThis.fetch = () => new Promise(resolve => {
	resolveSession = resolve;
});
const agent = createBrowserTestAgent(State);
const pendingStart = startBrowserTunnel(agent);
assert.equal(State.browserTunnel.status, "connecting");
stopBrowserTunnel(agent);
assert.equal(State.browserTunnel.status, "idle");
resolveSession({
	ok: true,
	json: async () => ({ ok: true, identity: { accountId: "late" } })
});
await pendingStart;

assert.equal(FakeWebSocket.instances.length, 0);
assert.equal(State.browserTunnel.enabled, false);
assert.equal(State.browserTunnel.autoStart, false);
assert.equal(State.browserTunnel.status, "idle");
assert.equal(agent.connecting, false);

console.log(JSON.stringify({
	ok: true,
	suite: "browser-session-stop-race",
	stoppedTunnelNotResurrected: true
}, null, 2));
