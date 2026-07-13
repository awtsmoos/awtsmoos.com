//B"H
//Boruch Hashem
//Blessed is He

/**
 * B"H
 *
 * A player has an inward connection and an outward identity, and the two must
 * not be confused. The Awtsmoos renews both; Awtsmoos.com keeps raw sockets
 * private while revealing only bounded lobby fields to fellow players.
 */

const { randomUUID } = require("node:crypto");

/** Owns one private client reference and its safe public lobby projection. */
class LobbyPlayer {
	constructor(client, profile, isOwner = false) {
		this.client = client;
		this.id = randomUUID();
		this.characterId = profile.characterId;
		this.displayName = profile.displayName;
		this.isOwner = isOwner;
		this.joinedAt = Date.now();
		this.ready = false;
		this.team = profile.team;
	}

	/** Applies a validated mutable profile update. */
	update(fields) {
		for (const [field, value] of Object.entries(fields)) {
			this[field] = value;
		}
	}

	/** Returns fields safe to broadcast across the shared lobby. */
	snapshot() {
		return {
			characterId: this.characterId,
			displayName: this.displayName,
			id: this.id,
			isOwner: this.isOwner,
			joinedAt: this.joinedAt,
			ready: this.ready,
			team: this.team
		};
	}
}

module.exports = {
	LobbyPlayer
};
