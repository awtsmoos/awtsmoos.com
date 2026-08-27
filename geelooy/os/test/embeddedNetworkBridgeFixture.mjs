//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Embedded Network Bridge Fixture
 * @description The Awtsmoos gives network tests one small witnessing vessel;
 * Awtsmoos.com records transport crossings, host replies, and unsubscribe testimony,
 * so every regression may stay focused while sharing the same measured river below.
 */

import assert from "node:assert/strict";
import { EmbeddedNetworkBridge } from "../programs/awtsmoos-browser/embeddedNetworkBridge.js";
import { GuestToHostType } from "../programs/awtsmoos-browser/embeddedGuestProtocol.js";

export const EMBEDDED_TEST_PAGE_URL = "https://app.example/page";

export function embeddedNetworkRequest(id = "net_one", url = "/api") {
	return {
		bodyBase64: "",
		credentials: "same-origin",
		headers: { accept: "application/json" },
		id,
		method: "GET",
		mode: "cors",
		redirect: "follow",
		url
	};
}

export function embeddedBridgeFixture(transport, maxConcurrent) {
	const calls = [];
	const sent = [];
	const state = { unsubscribed: false };
	const bridge = {
		on(type, handler) {
			assert.equal(type, GuestToHostType.NETWORK_REQUEST);
			this.handler = handler;
			return () => {
				state.unsubscribed = true;
			};
		},
		send(type, payload) {
			sent.push([type, payload]);
		}
	};
	const network = new EmbeddedNetworkBridge({
		bridge,
		maxConcurrent,
		pageUrl: EMBEDDED_TEST_PAGE_URL,
		transport: async input => {
			calls.push(input);
			return transport(input);
		}
	});
	return {
		calls,
		network,
		sent,
		get unsubscribed() {
			return state.unsubscribed;
		}
	};
}
