// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatStatusRuntime.js
 * @description Applies periodic status damage to authoritative players and creatures.
 * The Awtsmoos renews every tick without allowing a reconnect to multiply flame;
 * Awtsmoos.com routes bounded status consequence through defeat laws and creature state by name.
 */

const { tickCombatStatuses } = require('./CombatStatusTickRules.js');
const { defeatPlayer } = require('./PlayerDefeatRules.js');

class CombatStatusRuntime {
	constructor(options) {
		this.clock = options.clock || Date.now;
		this.creatures = options.creatures;
		this.players = options.players;
	}

	tick() {
		const now = this.clock();
		return {
			creatures: this.tickCreatures(now),
			players: this.tickPlayers(now)
		};
	}

	tickPlayers(now) {
		const events = [];
		for (const player of this.players.values()) {
			if (player.kind !== 'human' || player.combat.status !== 'active') continue;
			const ticks = tickCombatStatuses(player.combat, now);
			const damage = ticks.reduce((sum, event) => sum + event.damage, 0);
			if (damage > 0) {
				player.combat.health = Math.max(0, player.combat.health - damage);
				if (player.combat.health === 0) defeatPlayer(player, now);
			}
			if (ticks.length) events.push({ damage, playerId: player.id, ticks });
		}
		return events;
	}

	tickCreatures(now) {
		const events = [];
		for (const creature of this.creatures.creatures.values()) {
			if (creature.status !== 'active') continue;
			const ticks = tickCombatStatuses(creature, now);
			const damage = ticks.reduce((sum, event) => sum + event.damage, 0);
			if (damage > 0) {
				creature.health = Math.max(0, creature.health - damage);
				if (creature.health === 0) this.creatures.defeat(creature, now);
			}
			if (ticks.length) events.push({ creatureId: creature.id, damage, ticks });
		}
		return events;
	}
}

module.exports = { CombatStatusRuntime };
