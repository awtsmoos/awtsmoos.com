// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HostileCombatService.js
 * @description Advances status ticks, movement, action timelines, recovery, and snapshots.
 * The Awtsmoos renews pursuit and restraint beneath one clock; Awtsmoos.com replaces
 * invisible damage with server-owned status, warning, impact, recovery, and cancellation.
 */

const { combatSnapshot } = require('./CombatState.js');
const { CombatStatusRuntime } = require('./CombatStatusRuntime.js');
const { EnemyActionRuntime } = require('./EnemyActionRuntime.js');

class HostileCombatService {
	constructor(options) {
		this.clock = options.clock || Date.now;
		this.creatures = options.creatures;
		this.defense = options.defense;
		this.players = options.players;
		this.actions = new EnemyActionRuntime(options);
		this.statuses = new CombatStatusRuntime(options);
	}

	tick(steps = 1) {
		const statusEvents = [];
		for (let index = 0; index < steps; index += 1) {
			statusEvents.push(this.statuses.tick());
			this.regeneratePlayers();
			this.actions.tick();
			this.creatures.tick(1);
		}
		return {
			creatures: this.creatures.snapshots(),
			players: [...this.players.values()]
				.filter(player => player.kind === 'human')
				.map(player => ({ combat: combatSnapshot(player.combat), id: player.id })),
			statusEvents
		};
	}

	regeneratePlayers() {
		const now = this.clock();
		for (const player of this.players.values()) {
			if (player.kind !== 'human' || player.combat.status !== 'active') continue;
			player.combat.stamina = Math.min(
				player.combat.maximumStamina,
				player.combat.stamina + 3
			);
			this.defense.regenerate(player, 4, now);
		}
	}
}

module.exports = { HostileCombatService };
