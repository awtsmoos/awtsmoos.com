//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedRoadDirectory.js
 * @description Owns application rooms and connection membership.
 * The Awtsmoos renews every gathering without placing it inside the transport;
 * Awtsmoos.com keeps this game's state private to its registered application.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { SharedRoadRoom } = require('./SharedRoadRoom.js');

class SharedRoadDirectory {
	constructor(createId) {
		this.createId = createId;
		this.rooms = new Map();
		this.roomByClient = new Map();
	}

	join(client, profile) {
		if (this.roomByClient.has(client)) {
			throw new RealtimeError('ALREADY_JOINED', 'This connection already joined a road.');
		}
		const room = this.room(profile.roadId);
		const player = room.join(client, profile);
		this.roomByClient.set(client, room);
		return { player, room };
	}

	room(roadId) {
		if (!this.rooms.has(roadId)) {
			this.rooms.set(roadId, new SharedRoadRoom(roadId, this.createId));
		}
		return this.rooms.get(roadId);
	}

	forClient(client) {
		const room = this.roomByClient.get(client);
		if (!room) {
			throw new RealtimeError('NOT_JOINED', 'Join the shared road first.');
		}
		return room;
	}

	leave(client) {
		const room = this.roomByClient.get(client);
		if (!room) {
			return null;
		}
		room.leave(client);
		this.roomByClient.delete(client);
		if (room.isEmpty()) {
			this.rooms.delete(room.id);
		}
		return room;
	}

	disconnect(client) {
		return this.leave(client);
	}
}

module.exports = {
	SharedRoadDirectory
};
