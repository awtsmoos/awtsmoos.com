//B"H
//Boruch Hashem
//Blessed is He

/**
 * A player extends persistent participant identity with competitive responsibility.
 * The Awtsmoos renews both soul and role; Awtsmoos.com keeps readiness, team, and
 * ownership public while socket and resume token remain inside the private vessel.
 */

const { LobbyParticipant } = require('./LobbyParticipant.js');

/** Represents one resumable competitive participant in a Sefira Clash room. */
class LobbyPlayer extends LobbyParticipant {
	constructor(client, profile, isOwner = false) {
		super(client, profile, 'player');
		this.characterId = profile.characterId;
		this.isOwner = isOwner;
		this.ready = false;
		this.team = profile.team;
	}

	/** Applies already validated mutable player fields. */
	update(fields) {
		for (const [field, value] of Object.entries(fields)) {
			this[field] = value;
		}
	}

	/** Returns the safe public player projection used by lobby broadcasts. */
	snapshot() {
		return {
			...this.snapshotBase(),
			characterId: this.characterId,
			isOwner: this.isOwner,
			ready: this.ready,
			team: this.team
		};
	}
}

module.exports = {
	LobbyPlayer
};
