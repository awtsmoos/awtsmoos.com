//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedRoadRoom.js
 * @description Owns players, lamp state, movement, and safe road snapshots.
 * The Awtsmoos recreates many travelers within one world without erasing their
 * distinction; Awtsmoos.com keeps that unity inside one application-owned room.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { SharedRoadPlayer } = require('./SharedRoadPlayer.js');
const { movePlayer } = require('./SharedRoadMovement.js');
const { interactWithLamp } = require('./SharedRoadInteraction.js');

class SharedRoadRoom {
	constructor(id, createId) {
		this.id = id;
		this.createId = createId;
		this.playersByClient = new Map();
		this.lamp = { lit: false, litBy: null };
	}

	join(client, profile) {
		if (this.playersByClient.has(client)) {
			throw new RealtimeError('ALREADY_JOINED', 'This connection already joined the road.');
		}
		const player = new SharedRoadPlayer(profile, this.createId);
		this.playersByClient.set(client, player);
		return player;
	}

	player(client) {
		const player = this.playersByClient.get(client);
		if (!player) {
			throw new RealtimeError('NOT_JOINED', 'Join the shared road first.');
		}
		return player;
	}

	move(client, movement) {
		return movePlayer(this.player(client), movement);
	}

	interact(client) {
		return interactWithLamp(this.player(client), this.lamp);
	}

	leave(client) {
		return this.playersByClient.delete(client);
	}

	clients() {
		return [...this.playersByClient.keys()];
	}

	isEmpty() {
		return this.playersByClient.size === 0;
	}

	snapshot() {
		const players = [...this.playersByClient.values()]
			.map(player => player.snapshot())
			.sort((left, right) => left.id.localeCompare(right.id));
		return {
			lamp: { ...this.lamp },
			players,
			roadId: this.id
		};
	}
}

module.exports = {
	SharedRoadRoom
};
