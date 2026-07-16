//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SharedRoadPlayer.js
 * @description Projects one durable character into the authoritative road room.
 * The Awtsmoos renews identity beyond every avatar; Awtsmoos.com reveals only
 * safe character fields while keeping account and reconnect secrets concealed.
 */

const { randomUUID } = require('node:crypto');

class SharedRoadPlayer {
	constructor(source = {}, createId = randomUUID) {
		this.id = source.characterId || source.id || createId();
		this.slot = source.slot || 'primary';
		this.displayName = source.displayName || 'Traveler';
		this.glyph = source.glyph || 'א';
		this.x = source.x ?? 2;
		this.y = source.y ?? 4;
		this.health = source.health ?? 12;
		this.maxHealth = source.maxHealth ?? 12;
		this.movementSequence = source.movementSequence || 0;
		this.attackSequence = source.attackSequence || 0;
		this.lastAttackAt = 0;
		this.sharedLight = source.sharedLight || 0;
		this.passageShards = source.passageShards || 0;
		this.rewardClaims = new Set(source.rewardClaims || []);
		this.revision = source.revision ?? -1;
	}

	claimReward(rewardId, amount) {
		if (this.rewardClaims.has(rewardId)) return false;
		this.rewardClaims.add(rewardId);
		this.sharedLight += amount;
		return true;
	}

	toRecord(existing = {}) {
		return {
			...existing,
			attackSequence: this.attackSequence,
			characterId: this.id,
			displayName: this.displayName,
			glyph: this.glyph,
			health: this.health,
			maxHealth: this.maxHealth,
			movementSequence: this.movementSequence,
			passageShards: this.passageShards,
			revision: this.revision,
			rewardClaims: [...this.rewardClaims],
			sharedLight: this.sharedLight,
			slot: this.slot,
			x: this.x,
			y: this.y
		};
	}

	snapshot() {
		return {
			attackSequence: this.attackSequence,
			displayName: this.displayName,
			glyph: this.glyph,
			health: this.health,
			id: this.id,
			maxHealth: this.maxHealth,
			movementSequence: this.movementSequence,
			passageShards: this.passageShards,
			sharedLight: this.sharedLight,
			x: this.x,
			y: this.y
		};
	}
}

module.exports = { SharedRoadPlayer };
