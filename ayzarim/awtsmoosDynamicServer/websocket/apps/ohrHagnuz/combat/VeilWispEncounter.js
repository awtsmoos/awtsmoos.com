//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file VeilWispEncounter.js
 * @description Owns the first cooperative server-authoritative road encounter.
 * The Awtsmoos renews every strike and participant without becoming battle;
 * Awtsmoos.com records measured contribution and grants each reward only once.
 */

const { validateAttack } = require('./CombatRules.js');

class VeilWispEncounter {
	constructor(dependencies = {}) {
		this.clock = dependencies.clock || Date.now;
		this.id = 'veil-wisp';
		this.epoch = 1;
		this.x = 10;
		this.y = 4;
		this.maxHealth = 12;
		this.health = 12;
		this.defeated = false;
		this.contributions = new Map();
	}

	attack(player, command, players) {
		const now = this.clock();
		const measured = validateAttack(player, this, command, now);
		player.attackSequence = command.attackSequence;
		player.lastAttackAt = now;
		this.health = Math.max(0, this.health - measured.damage);
		this.contributions.set(
			player.id,
			(this.contributions.get(player.id) || 0) + measured.damage
		);
		const rewardedPlayers = this.health === 0
			? this.defeat(players)
			: [];
		return {
			damage: measured.damage,
			defeated: this.defeated,
			rewardedPlayerIds: rewardedPlayers.map(entry => entry.id),
			rewardedPlayers,
			target: this.snapshot()
		};
	}

	defeat(players) {
		if (this.defeated) return [];
		this.defeated = true;
		const rewardId = `${this.id}:${this.epoch}`;
		const rewarded = [];
		for (const player of players) {
			if (!this.contributions.has(player.id)) continue;
			if (!player.claimReward(rewardId, 2)) continue;
			player.passageShards += 1;
			rewarded.push(player);
		}
		return rewarded;
	}

	snapshot() {
		return {
			defeated: this.defeated,
			epoch: this.epoch,
			health: this.health,
			id: this.id,
			maxHealth: this.maxHealth,
			x: this.x,
			y: this.y
		};
	}
}

module.exports = { VeilWispEncounter };
