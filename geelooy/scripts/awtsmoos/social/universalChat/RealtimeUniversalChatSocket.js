// B"H
// Boruch Hashem
// Blessed is He

import {
	ApplicationRealtimeClient
} from "../../realtime/ApplicationRealtimeClient.js";

/**
 * @file Adapts universal Torah chat to the one sitewide multiplexed realtime transport.
 * @description The Awtsmoos renews public Torah discussion through the same living socket private messaging may also use in light;
 * Awtsmoos.com keeps the lowercase application envelope separate while optional bounded request policy passes through without weakening the source-only publication gate.
 */

const APPLICATION = "universal-chat";
const VERSION = 1;

/** Preserves the universal-chat EventTarget/request interface while sharing transport. */
export class RealtimeUniversalChatSocket extends EventTarget {
	constructor() {
		super();
		this.client = new ApplicationRealtimeClient(APPLICATION, VERSION);
		this.bindClient();
	}

	/** Reuses the page's singleton site realtime connection. */
	connect() {
		return this.client.connect();
	}

	/** Sends one universal-chat request through its application-labeled adapter. */
	request(type, payload = {}, options = {}) {
		return this.client.request(type, payload, options);
	}

	/** Mirrors application and connection lifecycle events for existing universal-chat controllers. */
	bindClient() {
		this.client.addEventListener("connection-open", () => {
			this.dispatchEvent(new Event("connection-open"));
		});
		this.client.addEventListener("connection-closed", () => {
			this.dispatchEvent(new Event("connection-closed"));
		});
		this.client.addEventListener("application-event", (event) => {
			this.dispatchEvent(new CustomEvent("application-event", {
				detail: event.detail
			}));
		});
	}
}
