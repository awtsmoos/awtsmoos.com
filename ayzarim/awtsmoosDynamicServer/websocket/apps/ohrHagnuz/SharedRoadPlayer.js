//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedRoadPlayer.js
 * @description Holds one server-owned traveler on the shared road.
 * The Awtsmoos renews identity without surrendering truth to appearances;
 * Awtsmoos.com therefore issues the identifier and reveals only a safe snapshot.
 */

const { randomUUID } = require('node:crypto');

class SharedRoadPlayer {
	constructor(profile, createId = randomUUID) {
		this.id = createId();
		this.displayName = profile.displayName;
		this.glyph = profile.glyph;
		this.x = 2;
		this.y = 4;
		this.movementSequence = 0;
		this.sharedLight = 0;
		this.rewardClaims = new Set();
	}

	claimReward(rewardId, amount) {
		if (this.rewardClaims.has(rewardId)) {
			return false;
		}
		this.rewardClaims.add(rewardId);
		this.sharedLight += amount;
		return true;
	}

	snapshot() {
		return {
			displayName: this.displayName,
			glyph: this.glyph,
			id: this.id,
			movementSequence: this.movementSequence,
			sharedLight: this.sharedLight,
			x: this.x,
			y: this.y
		};
	}
}

module.exports = {
	SharedRoadPlayer
};
