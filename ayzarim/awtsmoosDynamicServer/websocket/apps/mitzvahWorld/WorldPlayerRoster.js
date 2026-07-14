// B"H
// Boruch Hashem
// Blessed is He

const { RealtimeError } = require('../../platform/RealtimeError.js');
const { createPlayer, snapshotPlayer } = require('./PlayerEntity.js');

/**
 * @file Owns player entities and their temporary transport attachments.
 * @description The Awtsmoos renews identity beneath changing socket garments.
 * Awtsmoos.com keeps public players distinct from clients while providing the
 * private reverse lookup required for participant-only trade and guild events.
 */

class WorldPlayerRoster {
	constructor(createEntityId) {
		this.createEntityId = createEntityId;
		this.players = new Map();
		this.clientPlayers = new Map();
	}

	join(client, profile) {
		if (this.clientPlayers.has(client)) {
			return this.playerFor(client);
		}
		const player = createPlayer({
			displayName: profile.displayName,
			id: this.createEntityId('player')
		});
		this.players.set(player.id, player);
		this.clientPlayers.set(client, player.id);
		return player;
	}

	attach(client, playerId) {
		const player = this.players.get(playerId);
		if (!player) {
			throw new RealtimeError(
				'SESSION_EXPIRED',
				'The session player no longer exists.'
			);
		}
		this.clientPlayers.set(client, playerId);
		return player;
	}

	detach(client) {
		const playerId = this.clientPlayers.get(client);
		if (!playerId) {
			return null;
		}
		this.clientPlayers.delete(client);
		return playerId;
	}

	leave(client) {
		const playerId = this.detach(client);
		if (!playerId) {
			return null;
		}
		this.players.delete(playerId);
		return playerId;
	}

	remove(playerId) {
		if (!this.players.delete(playerId)) {
			return false;
		}
		for (const [client, mappedId] of this.clientPlayers) {
			if (mappedId === playerId) {
				this.clientPlayers.delete(client);
			}
		}
		return true;
	}

	playerFor(client) {
		const player = this.players.get(this.clientPlayers.get(client));
		if (!player) {
			throw new RealtimeError(
				'NOT_IN_WORLD',
				'Join a world before issuing this command.'
			);
		}
		return player;
	}

	clientForPlayer(playerId) {
		for (const [client, mappedId] of this.clientPlayers) {
			if (mappedId === playerId) {
				return client;
			}
		}
		return null;
	}

	clients() {
		return [...this.clientPlayers.keys()];
	}

	snapshots() {
		return [...this.players.values()].map(snapshotPlayer);
	}
}

module.exports = {
	WorldPlayerRoster
};
