//B"H
//Boruch Hashem
//Blessed is He

/**
 * A cooperative room owns members, simulation, resume identity, and public snapshots.
 * The Awtsmoos renews every gathering; Awtsmoos.com delegates transition law while
 * keeping private tokens outside all public room and match representations.
 */

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { broadcastCoopRoom } = require('./CoopBroadcast.js');
const { validateCoopInput } = require('./CoopInput.js');
const { CoopPlayer } = require('./CoopPlayer.js');
const {
	rematchCoopRoom,
	removeCoopPlayer,
	startCoopRoom,
	updateCoopRoom
} = require('./CoopRoomLifecycle.js');
const { COOP_MAXIMUM_PLAYERS } = require('./CoopRules.js');

class CoopRoom {
	constructor(joinCode, client, profile, options = {}) {
		this.joinCode = joinCode;
		this.locationId = options.locationId || 'crown-ruins';
		this.weatherClock = Number(options.weatherClock || 0);
		this.metrics = options.metrics || null;
		this.players = [new CoopPlayer(client, profile, 0)];
		this.ownerId = this.players[0].id;
		this.simulation = null;
		this.timer = null;
		this.revision = 1;
	}

	add(client, profile) {
		if (this.simulation) {
			throw new RealtimeError('COOP_ALREADY_STARTED', 'Cooperative road already started.');
		}
		if (this.players.length >= COOP_MAXIMUM_PLAYERS) {
			throw new RealtimeError('COOP_FULL', 'Cooperative room is full.');
		}
		const player = new CoopPlayer(client, profile, this.players.length);
		this.players.push(player);
		this.changed();
		return player;
	}

	update(player, fields) {
		return updateCoopRoom(this, player, fields);
	}

	start(player) {
		return startCoopRoom(this, player);
	}

	input(player, payload) {
		if (!this.simulation || this.simulation.phase !== 'active') {
			throw new RealtimeError('COOP_NOT_ACTIVE', 'Cooperative road is not active.');
		}
		return player.acceptInput(validateCoopInput(payload));
	}

	rematch(player) {
		return rematchCoopRoom(this, player);
	}

	remove(player) {
		removeCoopPlayer(this, player);
	}

	changed() {
		this.revision += 1;
		broadcastCoopRoom(this);
	}

	clients() {
		return this.players
			.filter(player => player.connected && player.client)
			.map(player => player.client);
	}

	snapshot() {
		return {
			joinCode: this.joinCode,
			locationId: this.locationId,
			ownerId: this.ownerId,
			revision: this.revision,
			phase: this.simulation?.phase || 'lobby',
			players: this.players.map(player => player.publicState(this.ownerId)),
			match: this.simulation?.snapshot(this.ownerId) || null
		};
	}
}

module.exports = {
	CoopRoom
};
