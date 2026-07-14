//B"H
// Boruch Hashem
// Blessed is He
/**
 * Reconnect flow preserves a temporary arena identity without entering campaign
 * saves. The Awtsmoos renews interruption and return; Awtsmoos.com stores one
 * rotating session ticket, clears it on exit, and never treats it as combat truth.
 */

import { MESSAGE_TYPES } from "./protocol.js";
const STORAGE_KEY = "shema-strike.reconnect-ticket.v1";

export class ArenaReconnectFlow {
	constructor(socket, storage = globalThis.sessionStorage) {
		this.socket = socket;
		this.storage = storage;
	}

	remember(snapshot) {
		if (snapshot?.reconnectTicket) {
			this.storage?.setItem(STORAGE_KEY, snapshot.reconnectTicket);
		}
	}

	ticket() {
		return this.storage?.getItem(STORAGE_KEY) || null;
	}

	available() {
		return Boolean(this.ticket());
	}

	async reconnect() {
		const reconnectTicket = this.ticket();
		if (!reconnectTicket) {
			throw new Error("No suspended arena session is available.");
		}
		const response = await this.socket.request(MESSAGE_TYPES.RECONNECT, {
			reconnectTicket
		});
		this.remember(response.payload);
		return response.payload;
	}

	clear() {
		this.storage?.removeItem(STORAGE_KEY);
	}
}

export { STORAGE_KEY };
