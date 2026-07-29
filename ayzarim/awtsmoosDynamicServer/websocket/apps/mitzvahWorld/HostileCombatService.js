// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HostileCombatService.js
 * @description Advances movement, action timelines, recovery resources, and combat snapshots.
 * The Awtsmoos renews pursuit and restraint beneath one clock; Awtsmoos.com replaces
 * invisible immediate damage with server-owned warning, impact, recovery, and cancellation.
 */

const { combatSnapshot } = require('./CombatState.js');
const { EnemyActionRuntime } = require('./EnemyActionRuntime.js');

class HostileCombatService {
	constructor(options) {
		this.clock = options.clock || Date.now;
		this.creatures = options.creatures;
		this.defense = options.defense;
		this.players = options.players;
		this.actions = new EnemyActionRuntime(options);
	}
	tick(steps = 1) {
		for (let index = 0; index < steps; index += 1) {
			this.regeneratePlayers();
			this.actions.tick();
			this.creatures.tick(1);
		}
		return {
			creatures: this.creatures.snapshots(),
			players: [...this.players.values()]
				.filter(player => player.kind === 'human')
				.map(player => ({ combat: combatSnapshot(player.combat), id: player.id }))
		};
	}
	regeneratePlayers() {
		const now = this.clock();
		for (const player of this.players.values()) {
			if (player.kind !== 'human' || player.combat.status !== 'active') continue;
			player.combat.stamina = Math.min(player.combat.maximumStamina, player.combat.stamina + 3);
			this.defense.regenerate(player, 4, now);
		}
	}
}

module.exports = { HostileCombatService };
