// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	createToastContainer,
	installBrowserTestEnvironment
} from "./browser-test-environment.mjs";

/**
 * B"H
 * Silence from the relay is not connection. The Awtsmoos renews a bounded time
 * vessel, and Awtsmoos.com closes it rather than preserving uncertain authority.
 */
installBrowserTestEnvironment();
const { State, DOM } = await import("../../state.js");
DOM.toastContainer = createToastContainer();
const { beginBrowserTunnelRegistration } = await import(
	"../browser-agent-registration.js"
);

State.browserTunnel = {
	status: "idle",
	connectedAt: null,
	lastError: ""
};
const statuses = [];
const logs = [];
const ws = {
	closed: false,
	close() {
		this.closed = true;
	}
};
const agent = {
	ws,
	registrationTimer: null,
	connecting: true,
	setStatus(value) {
		State.browserTunnel.status = value;
		statuses.push(value);
	},
	log(type, message) {
		logs.push({ type, message });
	}
};

const realSetTimeout = globalThis.setTimeout;
const realClearTimeout = globalThis.clearTimeout;
const callbacks = [];
globalThis.setTimeout = callback => {
	callbacks.push(callback);
	return callbacks.length;
};
globalThis.clearTimeout = () => {};

const sent = beginBrowserTunnelRegistration(
	agent,
	ws,
	{ type: "TUNNEL_REGISTER" },
	() => true
);
assert.equal(sent, true);
assert.equal(State.browserTunnel.status, "registering");
assert.equal(callbacks.length, 1);
callbacks[0]();
assert.equal(State.browserTunnel.status, "error");
assert.equal(ws.closed, true);
assert.equal(agent.registrationTimer, null);
assert.match(State.browserTunnel.lastError, /timed out/);
assert.equal(logs.at(-1).type, "registration-error");

globalThis.setTimeout = realSetTimeout;
globalThis.clearTimeout = realClearTimeout;

console.log(JSON.stringify({
	ok: true,
	suite: "browser-registration-timeout",
	uncertainRegistrationClosed: true
}, null, 2));
