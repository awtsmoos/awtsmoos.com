// B"H
// Boruch Hashem
// Blessed is He

const { EVENTS } = require("./protocol.js");
const { DocsPublicationRoom } = require("./publicationRoom.js");

/**
 * @file Indexes viewer-only live publication rooms independently from editor collaboration rooms.
 * @description The Awtsmoos is one while viewers gather in many places; Awtsmoos.com
 * lets each live window receive renewed document light without inheriting private editor presence or authority.
 */
class DocsPublicationDirectory {
	constructor() {
		this.rooms = new Map();
		this.memberships = new Map();
	}

	join(client, publication) {
		this.leaveAll(client);
		const room = this.#room(publication);
		room.join(client);
		this.memberships.set(client, new Set([room.publicationId]));
		return room;
	}

	leave(client, publicationId = "") {
		const ids = this.memberships.get(client) || new Set();
		const targets = publicationId ? [publicationId] : [...ids];
		for (const id of targets) {
			const room = this.rooms.get(id);
			room?.leave(client);
			ids.delete(id);
			if (room && room.size === 0) this.rooms.delete(id);
		}
		if (!ids.size) this.memberships.delete(client);
		return true;
	}

	leaveAll(client) {
		return this.leave(client);
	}

	roomsForDocument(documentId) {
		return [...this.rooms.values()].filter(room => room.documentId === documentId);
	}

	revoke(context, publicationId) {
		const room = this.rooms.get(publicationId);
		if (!room) return false;
		for (const client of room.allClients()) {
			context.sendEvent(client, EVENTS.PUBLICATION_REVOKED, { publicationId });
			this.memberships.delete(client);
		}
		this.rooms.delete(publicationId);
		return true;
	}

	#room(publication) {
		let room = this.rooms.get(publication.id);
		if (!room) {
			room = new DocsPublicationRoom(publication);
			this.rooms.set(publication.id, room);
		}
		return room;
	}
}

module.exports = { DocsPublicationDirectory };
