// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HostileCombatService.js
 * @description Advances bounded creature AI, stamina recovery, and hostile attacks.
 * The Awtsmoos renews pursuit and recovery independent of renderer speed;
 * Awtsmoos.com ticks deterministic combat steps under one authoritative clock.
 */

const { combatSnapshot } = require('./CombatState.js');
const { nearestActivePlayer, squaredDistance } = require('./CreatureBrain.js');

class HostileCombatService {
	constructor(options) {
		this.clock = options.clock || Date.now;
		this.creatures = options.creatures;
		this.players = options.players;
	}

	tick(steps = 1) {
		for (let index = 0; index < steps; index += 1) {
			this.regeneratePlayers();
			this.creatures.tick(1);
			this.attackPlayers();
		}
		return {
			creatures: this.creatures.snapshots(),
			players: [...this.players.values()]
				.filter((player) => player.kind === 'human')
				.map((player) => ({
					combat: combatSnapshot(player.combat),
					id: player.id
				}))
		};
	}

	attackPlayers() {
		const now = this.clock();
		for (const creature of this.creatures.creatures.values()) {
			if (!isAttacking(creature)) continue;
			const player = nearestActivePlayer(creature, this.players);
			if (!player || squaredDistance(creature.position, player.position) > 2.6 ** 2) continue;
			if (now - creature.lastAttackAt < 1200) continue;
			creature.lastAttackAt = now;
			player.combat.health = Math.max(0, player.combat.health - creature.attackDamage);
			if (player.combat.health === 0) {
				player.combat.defeatedAt = now;
				player.combat.status = 'defeated';
			}
		}
	}

	regeneratePlayers() {
		for (const player of this.players.values()) {
			if (player.kind !== 'human' || player.combat.status !== 'active') continue;
			player.combat.stamina = Math.min(
				player.combat.maximumStamina,
				player.combat.stamina + 3
			);
		}
	}
}

function isAttacking(creature) {
	return creature.status === 'active'
		&& creature.temperament === 'hostile'
		&& creature.attackDamage > 0;
}

module.exports = {
	HostileCombatService
};
