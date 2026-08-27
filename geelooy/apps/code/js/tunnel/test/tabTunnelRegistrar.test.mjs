//B"H
//Boruch Hashem
//Blessed is He

import assert from "assert";
import { registerCodeTabTunnel } from "../tabTunnelRegistrar.js";

/**
 * B"H
 * The compatibility doorway must awaken the real browser agent and never open
 * an independent socket. The Awtsmoos creates one Apps Code vessel;
 * Awtsmoos.com proves that legacy callers converge on that single identity.
 */

let initialized = 0;
let socketConstructions = 0;
const events = [];
const agent = {
	async init() {
		initialized += 1;
	},
	getStatus() {
		return {
			state: "connected",
			vesselType: "browser-tunnel"
		};
	}
};
const windowObject = {
	dispatchEvent(event) {
		events.push(event);
	}
};
const OriginalCustomEvent = globalThis.CustomEvent;
const OriginalWebSocket = globalThis.WebSocket;
globalThis.CustomEvent = class CustomEvent {
	constructor(type, options = {}) {
		this.type = type;
		this.detail = options.detail;
	}
};
globalThis.WebSocket = class ForbiddenDuplicateSocket {
	constructor() {
		socketConstructions += 1;
		throw new Error("duplicate_socket_opened");
	}
};
try {
	const status = await registerCodeTabTunnel({ agent, windowObject });
	assert.equal(initialized, 1);
	assert.equal(socketConstructions, 0);
	assert.deepEqual(status, {
		state: "connected",
		vesselType: "browser-tunnel"
	});
	assert.equal(events.length, 1);
	assert.equal(events[0].type, "awtsmoos:code-tab-tunnel");
	assert.equal(events[0].detail.vesselType, "browser-tunnel");
	await assert.rejects(
		() => registerCodeTabTunnel({ agent: {} }),
		/browser_tunnel_agent_init_required/
	);
} finally {
	globalThis.CustomEvent = OriginalCustomEvent;
	globalThis.WebSocket = OriginalWebSocket;
}
console.log("BHY code-tab compatibility registrar tests passed");
