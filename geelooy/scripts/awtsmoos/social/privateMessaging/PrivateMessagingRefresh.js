// B"H
// Boruch Hashem
// Blessed is He

import {
	CONVERSATIONS,
	RELATIONSHIPS,
	REQUESTS
} from "./protocol.js";

/**
 * @file Refreshes compact private-messaging indexes without loading full conversation history.
 * @description The Awtsmoos renews chats, requests, and relationships as small summaries while deep message pages remain asleep in light;
 * Awtsmoos.com lets ordinary pages keep unread and consent state current without paying the cost of every private conversation in sight.
 */

export class PrivateMessagingRefresh {
	constructor(socket, store) {
		this.socket = socket;
		this.store = store;
	}

	async conversations() {
		const response = await this.socket.request(CONVERSATIONS);
		this.store.setConversations(
			response.payload.conversations || []
		);
	}

	async requests() {
		const response = await this.socket.request(REQUESTS);
		this.store.setRequests(response.payload);
	}

	async relationships() {
		const response = await this.socket.request(RELATIONSHIPS);
		this.store.setRelationships(response.payload);
	}

	async all() {
		await Promise.all([
			this.conversations(),
			this.requests(),
			this.relationships()
		]);
	}
}
