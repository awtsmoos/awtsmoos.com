//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module EmbeddedGuestBootstrap
 * @description The Awtsmoos composes one guarded browser-world from smaller lights;
 * Awtsmoos.com joins markup, navigation, and host-mediated fetch beneath one channel,
 * so native page JavaScript may live without discovering an unmeasured network trail.
 */

import {
	EMBEDDED_GUEST_PROTOCOL,
	GuestToHostType,
	HostToGuestType
} from "./embeddedGuestProtocol.js";
import { embeddedGuestMarkupSource } from "./embeddedGuestMarkupSource.js";
import { embeddedGuestNavigationSource } from "./embeddedGuestNavigationSource.js";
import { embeddedGuestNetworkCodecSource } from "./embeddedGuestNetworkCodecSource.js";
import { embeddedGuestNetworkRequestSource } from "./embeddedGuestNetworkRequestSource.js";
import { embeddedGuestNetworkLifecycleSource } from "./embeddedGuestNetworkLifecycleSource.js";

export function embeddedGuestBootstrap(channelId, scriptNonce) {
	const types = guestMessageTypes();
	const markupSource = embeddedGuestMarkupSource();
	const navigationSource = embeddedGuestNavigationSource(types);
	const networkCodecSource = embeddedGuestNetworkCodecSource();
	const networkRequestSource = embeddedGuestNetworkRequestSource();
	const networkLifecycleSource = embeddedGuestNetworkLifecycleSource({
		request: types.networkRequest,
		response: types.networkResponse
	});
	return `(function() {
	const protocol = ${literal(EMBEDDED_GUEST_PROTOCOL)};
	const channelId = ${literal(channelId)};
	const scriptNonce = ${literal(scriptNonce)};
	const root = document.getElementById("awtsmoos-guest-root");
	let navigationReady = false;
	let pageBaseUrl = "";

	function send(type, payload) {
		parent.postMessage({ protocol, channelId, type, payload }, "*");
	}
${markupSource}
${navigationSource}
${networkCodecSource}
${networkRequestSource}
${networkLifecycleSource}
	addEventListener("message", event => {
		if (event.source !== parent) return;
		const message = event.data;
		if (!message || message.protocol !== protocol || message.channelId !== channelId) return;
		if (message.type === ${literal(types.networkResponse)}
			|| message.type === ${literal(types.networkError)}) {
			settleNetworkMessage(message.type, message.payload);
			return;
		}
		if (message.type === ${literal(types.render)}) renderGuest(message.payload);
		if (message.type === ${literal(types.reset)}) resetGuest();
	});

	addEventListener("error", event => {
		send(${literal(types.error)}, {
			message: String(event.message || "guest-error")
		});
	});

	addEventListener("unhandledrejection", event => {
		send(${literal(types.error)}, {
			message: String(event.reason || "unhandled-rejection")
		});
	});

	const guarded = guardNavigation();
	send(${literal(types.ready)}, {
		navigationGuarded: guarded,
		state: "ready"
	});
})();`;
}

function guestMessageTypes() {
	return {
		error: GuestToHostType.ERROR,
		navigate: GuestToHostType.NAVIGATE,
		networkError: HostToGuestType.NETWORK_ERROR,
		networkRequest: GuestToHostType.NETWORK_REQUEST,
		networkResponse: HostToGuestType.NETWORK_RESPONSE,
		popup: GuestToHostType.POPUP,
		ready: GuestToHostType.READY,
		render: HostToGuestType.RENDER,
		reset: HostToGuestType.RESET
	};
}

function literal(value) {
	return JSON.stringify(String(value || ""))
		.replace(/</g, "\\u003c")
		.replace(/>/g, "\\u003e");
}
