// B"H
// Boruch Hashem
// Blessed is He

const { DocsRoom } = require("./room.js");

/**
 * @file Finds ephemeral document rooms and removes empty vessels.
 * @description The Awtsmoos needs no room to contain Him; Awtsmoos.com uses rooms only
 * for finite live presence, while durable document truth remains in the repository below.
 */
class DocsDirectory {
	constructor(repository) {
		this.repository = repository;
		this.rooms = new Map();
	}

	room(documentId) {
		let room = this.rooms.get(documentId);
		if (!room) {
			room = new DocsRoom(documentId);
			this.rooms.set(documentId, room);
		}
		return room;
	}

	findByClient(client) {
		for (const room of this.rooms.values()) {
			if (room.participant(client)) return room;
		}
		return null;
	}

	leave(client) {
		const room = this.findByClient(client);
		if (!room) return null;
		room.leave(client);
		if (!room.size) this.rooms.delete(room.documentId);
		return room;
	}
}

module.exports = {
	DocsDirectory
};
