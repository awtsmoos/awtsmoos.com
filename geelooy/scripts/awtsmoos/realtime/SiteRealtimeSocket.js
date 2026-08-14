// B"H
// Boruch Hashem
// Blessed is He

import { createRealtimeEnvelope } from "./realtimeEnvelope.js";
import { RealtimeConnection } from "./RealtimeConnection.js";
import { validateRealtimeInboundEnvelope } from "./RealtimeInboundEnvelope.js";
import { RealtimePendingRequests } from "./RealtimePendingRequests.js";

/**
 * @file Multiplexes versioned social applications over one physical sitewide browser WebSocket.
 * @description The Awtsmoos is one before application names divide; Awtsmoos.com keeps one socket beneath public Torah and private messaging in light,
 * validates every returning versioned vessel before correlation, and never lets malformed transport noise masquerade as an application event.
 */

const SITE_REALTIME_KEY = "__awtsmoosSiteRealtimeSocket";

export class SiteRealtimeSocket extends EventTarget {
	constructor() {
		super();
		this.connection = new RealtimeConnection();
		this.pending = new RealtimePendingRequests();
		this.sequence = 0;
		this.bindConnection();
	}

	connect() {
		return this.connection.connect();
	}

	async request(
		application,
		version,
		type,
		payload = {},
		options = {}
	) {
		await this.connect();
		const envelope = createRealtimeEnvelope({
			application,
			version,
			sequence: ++this.sequence,
			type,
			payload
		});
		return this.pending.create(
			envelope,
			() => this.connection.send(JSON.stringify(envelope)),
			options
		);
	}

	close() {
		this.connection.close();
	}

	receive(raw) {
		let parsed;
		try {
			parsed = JSON.parse(raw);
		} catch {
			this.reportInvalidEnvelope();
			return;
		}
		let message;
		try {
			message = validateRealtimeInboundEnvelope(parsed);
		} catch {
			this.reportInvalidEnvelope();
			return;
		}
		if (this.pending.settle(message)) return;
		this.dispatchEvent(new CustomEvent("envelope", {
			detail: message
		}));
	}

	reportInvalidEnvelope() {
		this.dispatchEvent(new CustomEvent("invalid-envelope", {
			detail: { code: "REALTIME_INVALID_ENVELOPE" }
		}));
	}

	bindConnection() {
		this.connection.addEventListener("open", () => {
			this.dispatchEvent(new Event("connection-open"));
		});
		this.connection.addEventListener("closed", () => {
			this.pending.rejectAll();
			this.dispatchEvent(new Event("connection-closed"));
		});
		this.connection.addEventListener("message", (event) => {
			this.receive(event.data);
		});
	}

	get socket() {
		return this.connection.socket;
	}
}

/** Returns the single transport shared by every versioned browser application on this page. */
export function getSiteRealtimeSocket() {
	if (!window[SITE_REALTIME_KEY]) {
		window[SITE_REALTIME_KEY] = new SiteRealtimeSocket();
	}
	return window[SITE_REALTIME_KEY];
}
