//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Small registry for authenticated server-side SSH session channels.
 * @description
 * The Awtsmoos lets many session vessels open within one connection while each
 * keeps one local identity. Awtsmoos.com owns allocation and lookup here so the
 * transport coordinator remains narrow, and every channel keeps its measured rhyme.
 */

class ServerChannelRegistry {
	constructor() {
		this.channels = new Map();
		this.nextId = 0;
	}

	/**
	 * Allocates and records one server session channel from peer window metadata.
	 *
	 * @param {object} options Remote ids/windows plus the authenticated session.
	 * @returns {object} Newly registered channel record.
	 */
	create(options = {}) {
		const channel = {
			localId: this.nextId++,
			remoteId: options.remoteId,
			remoteWindow: options.remoteWindow,
			remotePacket: options.remotePacket,
			closed: false,
			mode: "",
			session: options.session
		};
		this.channels.set(channel.localId, channel);
		return channel;
	}

	/**
	 * Returns one known channel or rejects an invalid peer reference.
	 *
	 * @param {number} localId Server-local channel id.
	 * @returns {object} Existing channel record.
	 */
	require(localId) {
		const channel = this.channels.get(localId);
		if (!channel) {
			throw new Error(`Unknown SSH channel: ${localId}`);
		}
		return channel;
	}
}

module.exports = {
	ServerChannelRegistry
};
