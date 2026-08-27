//B"H
//Boruch Hashem
//Blessed is He

/**
 * A spectator receives the shared arena without entering its competitive equation.
 * The Awtsmoos renews witness and fighter distinctly; Awtsmoos.com preserves that
 * boundary through a role-specific participant whose presence cannot alter victory.
 */

const { LobbyParticipant } = require('./LobbyParticipant.js');

/** Represents one resumable read-only participant in a lobby or active match. */
class LobbySpectator extends LobbyParticipant {
	constructor(client, profile) {
		super(client, profile, 'spectator');
	}

	/** Returns the safe public spectator projection. */
	snapshot() {
		return this.snapshotBase();
	}
}

module.exports = {
	LobbySpectator
};
