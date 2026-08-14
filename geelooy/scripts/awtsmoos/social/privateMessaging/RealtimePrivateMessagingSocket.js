// B"H
// Boruch Hashem
// Blessed is He

import { ApplicationRealtimeClient } from "../../realtime/ApplicationRealtimeClient.js";
import { APPLICATION, VERSION } from "./protocol.js";

/**
 * @file Adapts consent-based private messaging to the one sitewide multiplexed realtime transport.
 * @description The Awtsmoos renews private requests and accepted messages through the same socket that carries public Torah in light;
 * Awtsmoos.com keeps application ids distinct, preserves server authority, and may pass bounded request policy without creating another wire or another privacy law.
 */

export class RealtimePrivateMessagingSocket extends EventTarget {
	constructor() {
		super();
		this.client = new ApplicationRealtimeClient(APPLICATION, VERSION);
		this.bindClient();
	}

	connect() {
		return this.client.connect();
	}

	request(type, payload = {}, options = {}) {
		return this.client.request(type, payload, options);
	}

	bindClient() {
		for (const type of ["connection-open", "connection-closed"]) {
			this.client.addEventListener(type, () => {
				this.dispatchEvent(new Event(type));
			});
		}
		this.client.addEventListener("application-event", (event) => {
			this.dispatchEvent(new CustomEvent("application-event", {
				detail: event.detail
			}));
		});
	}
}
