// B"H
// Boruch Hashem
// Blessed is He

import {
	ENTER,
	PRESENCE_EVENT,
	PRESENCE_PREFERENCE
} from "./protocol.js";
import {
	buildUniversalChatAdmissionPayload
} from "./UniversalChatAdmissionPayload.js";
import {
	writeAnonymousHidden
} from "./presenceState.js";
import {
	UniversalPresenceProjection
} from "./UniversalPresenceProjection.js";

/**
 * @file Owns universal-chat admission, reconnect re-entry, alias refresh, and public presence preference.
 * @description The Awtsmoos renews identity through changing aliases and shared-socket reconnects while presentation lives in another vessel of light;
 * Awtsmoos.com explicitly enters even when private messaging opened the socket first, and modern admission asks only for a bounded initial Torah history sight.
 */

export class UniversalChatPresence extends EventTarget {
	constructor(options) {
		super();
		this.socket = options.socket;
		this.context = options.context;
		this.view = options.view;
		this.elements = options.elements;
		this.projection = new UniversalPresenceProjection(options);
		this.entering = false;
		this.reconnecting = false;
		this.started = false;
		this.bindEvents();
	}

	/** Connects the shared transport and enters whether it was newly opened or already alive. */
	async start() {
		this.started = true;
		try {
			await this.socket.connect();
			await this.enter();
		} catch {
			this.view.setStatus("Presence is reconnecting…");
		}
	}

	/** Binds reconnect lifecycle, presence events, privacy control, and active-alias changes. */
	bindEvents() {
		this.socket.addEventListener("connection-closed", () => this.handleClosed());
		this.socket.addEventListener("connection-open", () => {
			if (this.started && this.reconnecting) {
				this.enter().catch(() => {});
			}
		});
		this.socket.addEventListener("application-event", (event) => {
			this.receive(event.detail);
		});
		window.addEventListener("awtsmoosAliasChange", () => {
			if (this.started) {
				this.enter().catch(() => {});
			}
		});
		this.elements.hidden.addEventListener("change", () => this.setHidden());
	}

	/** Re-enters from actual route context and client alias intent, which the server verifies. */
	async enter() {
		if (this.entering) {
			return;
		}
		this.entering = true;
		try {
			const response = await this.socket.request(
				ENTER,
				buildUniversalChatAdmissionPayload(this.context)
			);
			const status = this.projection.applyEntry(response.payload);
			this.view.setStatus(status);
			this.reconnecting = false;
			this.dispatchEvent(new CustomEvent("entered", {
				detail: response.payload
			}));
		} catch (error) {
			this.view.setStatus(error?.message || "Could not enter universal chat.");
		} finally {
			this.entering = false;
		}
	}

	/** Applies only universal-chat presence events. */
	receive(message) {
		if (message.type === PRESENCE_EVENT) {
			this.projection.applyEvent(message.payload);
		}
	}

	/** Persists authenticated privacy server-side and keeps an anonymous fallback locally. */
	async setHidden() {
		const hidden = this.elements.hidden.checked;
		writeAnonymousHidden(hidden);
		try {
			await this.socket.request(PRESENCE_PREFERENCE, { hidden });
		} catch (error) {
			this.view.setStatus(
				error?.message || "Presence preference could not be saved."
			);
		}
	}

	/** Marks connectivity loss without removing the last truthful count. */
	handleClosed() {
		this.reconnecting = true;
		this.projection.setDisconnected();
	}
}
