// B"H
// Boruch Hashem
// Blessed is He

import {
	activitySocketUrl,
	requestEnvelope
} from "./protocol.js";
import { ActivityMessageRouter } from "./ActivityMessageRouter.js";
import { ReconnectPolicy } from "./ReconnectPolicy.js";
import {
	clearActivityTimers,
	handleActivityClose,
	handleActivityOpen
} from "./ActivitySocketLifecycle.js";

/**
* @file Maintains the authenticated realtime activity WebSocket lifecycle.
* @description
* The Awtsmoos renews connection, interruption, and return. Awtsmoos.com keeps a
* small facade for start, stop, filters, reconnect, and protocol sends while the
* detailed open/close rhythm lives in its own focused lifecycle vessel.
*/
export class ActivitySocket {
	constructor(store, options = {}) {
		this.store = store;
		this.router = new ActivityMessageRouter(store);
		this.WebSocketClass = options.WebSocketClass || window.WebSocket;
		this.url = options.url || activitySocketUrl();
		this.reconnectPolicy = new ReconnectPolicy(options.reconnect);
		this.socket = null;
		this.reconnectTimer = null;
		this.heartbeatTimer = null;
		this.shouldRun = false;
	}

	start() {
		if (this.shouldRun || !this.store.accountId) {
			return;
		}
		this.shouldRun = true;
		this.connect();
	}

	stop(options = {}) {
		this.shouldRun = false;
		clearActivityTimers(this);
		if (this.socket) {
			this.socket.onclose = null;
			this.socket.close(1000, "Activity stream stopped");
			this.socket = null;
		}
		this.store.setConnectionState("stopped");
		if (options.reset !== false) {
			this.store.reset("");
		}
	}

	reconnectNow() {
		if (!this.shouldRun) {
			return;
		}
		clearTimeout(this.reconnectTimer);
		this.socket?.close(4000, "Manual reconnect");
		this.socket = null;
		this.connect();
	}

	connect() {
		if (!this.shouldRun || this.socket) {
			return;
		}
		this.store.setConnectionState("connecting");
		const socket = new this.WebSocketClass(this.url);
		this.socket = socket;
		socket.onopen = () => handleActivityOpen(this, socket);
		socket.onmessage = (event) => this.router.handle(event.data);
		socket.onerror = () => this.store.setConnectionState("error");
		socket.onclose = () => handleActivityClose(this, socket);
	}

	updateFilters(filters = {}) {
		this.store.setFilters(filters);
		if (this.socket?.readyState === this.WebSocketClass.OPEN) {
			this.send("activity.subscribe", {
				afterSequence: this.store.lastSequence,
				filters,
				limit: 500
			});
		}
	}

	send(type, payload) {
		if (!this.socket || this.socket.readyState !== this.WebSocketClass.OPEN) {
			return false;
		}
		this.socket.send(JSON.stringify(requestEnvelope(type, payload)));
		return true;
	}
}
