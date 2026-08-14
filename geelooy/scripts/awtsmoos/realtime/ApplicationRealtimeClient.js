// B"H
// Boruch Hashem
// Blessed is He

import { getSiteRealtimeSocket } from "./SiteRealtimeSocket.js";

/**
 * @file Gives one versioned application a narrow view of the single sitewide realtime transport.
 * @description The Awtsmoos is one before applications divide into names; Awtsmoos.com lets each finite client hear only its own events in light,
 * while optional request policy passes through the shared transport without granting applications ownership of the physical socket.
 */

export class ApplicationRealtimeClient extends EventTarget {
	constructor(application, version = 1) {
		super();
		this.application = application;
		this.version = version;
		this.transport = getSiteRealtimeSocket();
		this.bindTransport();
	}

	connect() {
		return this.transport.connect();
	}

	request(type, payload = {}, options = {}) {
		return this.transport.request(
			this.application,
			this.version,
			type,
			payload,
			options
		);
	}

	bindTransport() {
		this.transport.addEventListener("connection-open", () => {
			this.dispatchEvent(new Event("connection-open"));
		});
		this.transport.addEventListener("connection-closed", () => {
			this.dispatchEvent(new Event("connection-closed"));
		});
		this.transport.addEventListener("envelope", (event) => {
			const message = event.detail;
			if (message.application !== this.application) return;
			if (message.version !== this.version) return;
			this.dispatchEvent(new CustomEvent("application-event", {
				detail: message
			}));
		});
	}
}
