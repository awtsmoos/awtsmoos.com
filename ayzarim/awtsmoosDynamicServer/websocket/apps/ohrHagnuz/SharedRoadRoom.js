//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedRoadRoom.js
 * @description Owns travelers, lamp, movement, and the cooperative Veil Wisp.
 * The Awtsmoos recreates many distinct souls within one world; Awtsmoos.com
 * keeps their shared events authoritative without exposing account identity.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { SharedRoadPlayer } = require('./SharedRoadPlayer.js');
const { movePlayer } = require('./SharedRoadMovement.js');
const { interactWithLamp, LAMP_POSITION } = require('./SharedRoadInteraction.js');
const { VeilWispEncounter } = require('./combat/VeilWispEncounter.js');

class SharedRoadRoom {
	constructor(id, dependencies = {}) {
		this.id = id;
		this.createId = dependencies.createId;
		this.playersByClient = new Map();
		this.lamp = { lit: false, litBy: null };
		this.encounter = new VeilWispEncounter(dependencies);
	}

	join(client, source) {
		if (this.playersByClient.has(client)) {
			throw new RealtimeError('ALREADY_JOINED', 'This connection already joined the road.');
		}
		const player = source instanceof SharedRoadPlayer
			? source
			: new SharedRoadPlayer(source, this.createId);
		this.playersByClient.set(client, player);
		return player;
	}

	player(client) {
		const player = this.playersByClient.get(client);
		if (!player) throw new RealtimeError('NOT_JOINED', 'Join the shared road first.');
		return player;
	}

	move(client, movement) {
		return movePlayer(this.player(client), movement);
	}

	interact(client) {
		return interactWithLamp(this.player(client), this.lamp);
	}

	attack(client, command) {
		return this.encounter.attack(
			this.player(client),
			command,
			this.players()
		);
	}

	leave(client) {
		const player = this.playersByClient.get(client) || null;
		this.playersByClient.delete(client);
		return player;
	}

	clients() {
		return [...this.playersByClient.keys()];
	}

	players() {
		return [...this.playersByClient.values()];
	}

	isEmpty() {
		return this.playersByClient.size === 0;
	}

	snapshot() {
		const players = this.players()
			.map(player => player.snapshot())
			.sort((left, right) => left.id.localeCompare(right.id));
		return {
			encounter: this.encounter.snapshot(),
			lamp: { ...this.lamp, ...LAMP_POSITION },
			players,
			roadId: this.id
		};
	}
}

module.exports = { SharedRoadRoom };
