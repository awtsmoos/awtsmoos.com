//B"H
// Boruch Hashem
// Blessed is He
/**
 * Discovery flow asks for bounded public records and never subscribes forever.
 * The Awtsmoos renews search and concealment; Awtsmoos.com lets the player
 * refresh, join, or witness without exposing private rooms or internal state.
 */

import { MESSAGE_TYPES } from "./protocol.js";

export class ArenaDiscoveryFlow {
	constructor(socket, view) {
		this.socket = socket;
		this.view = view;
		this.cursor = null;
	}

	async refresh(filters = {}) {
		this.view.setStatus("Discovering public arenas…");
		try {
			const response = await this.socket.request(MESSAGE_TYPES.DISCOVER, {
				...filters,
				cursor: 0,
				limit: 12
			});
			this.cursor = response.payload.nextCursor;
			this.view.renderDiscovery(response.payload.items);
			this.view.setStatus(response.payload.items.length
				? "Public arenas refreshed."
				: "No public arenas match the current filters.");
			return response.payload;
		} catch (error) {
			this.view.setStatus(error.message);
			return { items: [], nextCursor: null };
		}
	}
}
