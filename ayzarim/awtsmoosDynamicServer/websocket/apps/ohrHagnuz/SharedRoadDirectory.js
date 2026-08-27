//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedRoadDirectory.js
 * @description Owns rooms, clients, and exclusive durable character presence.
 * The Awtsmoos renews every gathering without duplicating one soul into two;
 * Awtsmoos.com permits one active socket vessel for each online character.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { SharedRoadPlayer } = require('./SharedRoadPlayer.js');
const { SharedRoadRoom } = require('./SharedRoadRoom.js');

class SharedRoadDirectory {
	constructor(dependencies = {}) {
		this.dependencies = typeof dependencies === 'function'
			? { createId: dependencies }
			: dependencies;
		this.rooms = new Map();
		this.roomByClient = new Map();
		this.clientByCharacter = new Map();
	}

	join(client, profile) {
		const player = new SharedRoadPlayer(profile, this.dependencies.createId);
		return this.attach(client, player, profile.roadId);
	}

	attach(client, player, roadId) {
		if (this.roomByClient.has(client)) {
			throw new RealtimeError('ALREADY_JOINED', 'This connection already joined a road.');
		}
		if (this.clientByCharacter.has(player.id)) {
			throw new RealtimeError(
				'CHARACTER_ALREADY_ACTIVE',
				'This online character is active in another connection.'
			);
		}
		const room = this.room(roadId);
		room.join(client, player);
		this.roomByClient.set(client, room);
		this.clientByCharacter.set(player.id, client);
		return { player, room };
	}

	room(roadId) {
		if (!this.rooms.has(roadId)) {
			this.rooms.set(
				roadId,
				new SharedRoadRoom(roadId, this.dependencies)
			);
		}
		return this.rooms.get(roadId);
	}

	forClient(client) {
		const room = this.roomByClient.get(client);
		if (!room) throw new RealtimeError('NOT_JOINED', 'Join the shared road first.');
		return room;
	}

	leave(client) {
		const room = this.roomByClient.get(client);
		if (!room) return null;
		const player = room.leave(client);
		this.roomByClient.delete(client);
		if (player) this.clientByCharacter.delete(player.id);
		if (room.isEmpty()) this.rooms.delete(room.id);
		return { player, room };
	}

	disconnect(client) {
		return this.leave(client);
	}
}

module.exports = { SharedRoadDirectory };
