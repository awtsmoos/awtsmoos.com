// B"H
// Boruch Hashem
// Blessed is He

import {
	OPEN
} from "./protocol.js";
import {
	currentAlias
} from "../universalChat/presenceState.js";
import {
	PrivateMessagingRefresh
} from "./PrivateMessagingRefresh.js";
import {
	PrivateMessagingSessionEvents
} from "./PrivateMessagingSessionEvents.js";

/**
 * @file Maintains verified-alias private messaging admission and compact refresh state while live event routing lives elsewhere.
 * @description The Awtsmoos renews accepted rooms through one alias gate while Awtsmoos.com keeps reconnect noise and application events outside admission light.
 */

export class PrivateMessagingSession extends EventTarget {
	constructor(socket, store) {
		super();
		this.socket = socket;
		this.store = store;
		this.refresh = new PrivateMessagingRefresh(socket, store);
		this.started = false;
		this.opened = false;
		this.reconnecting = false;
		this.events = new PrivateMessagingSessionEvents(this);
		this.events.bind();
	}

	/** Opens the shared transport and verified private session when an active alias exists. */
	async start() {
		this.started = true;
		if (!currentAlias()) {
			return false;
		}
		await this.socket.connect();
		await this.open();
		return true;
	}

	/** Re-opens authorization and compact index state for the current owned alias. */
	async open() {
		const alias = currentAlias();
		if (!alias) {
			this.opened = false;
			return false;
		}
		const response = await this.socket.request(
			OPEN,
			{ alias }
		);
		this.store.adoptSession(response.payload);
		this.opened = true;
		this.reconnecting = false;
		this.dispatchEvent(new CustomEvent("opened", {
			detail: response.payload
		}));
		return true;
	}

	/** Refreshes only compact conversation summaries while preserving lazy message history. */
	refreshConversations() {
		return this.opened
			? this.refresh.conversations()
			: Promise.resolve();
	}

	/** Refreshes only compact incoming/outgoing request state. */
	refreshRequests() {
		return this.opened
			? this.refresh.requests()
			: Promise.resolve();
	}

	/** Refreshes mutual friends, blocks, and contact-request policy state. */
	refreshRelationships() {
		return this.opened
			? this.refresh.relationships()
			: Promise.resolve();
	}
}
