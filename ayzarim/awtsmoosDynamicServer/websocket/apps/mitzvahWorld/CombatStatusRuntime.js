// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatStatusRuntime.js
 * @description Applies periodic status damage, Kavanah disruption, defeat, protected boss finish, and phase updates.
 * The Awtsmoos renews every tick without allowing reconnect to multiply flame;
 * Awtsmoos.com routes bounded consequence through defeat, concentration, Kedem sequence, and creature state.
 */

const {
	applyCombatStatusCreatureDamage
} = require('./CombatStatusCreatureDamage.js');
const {
	finalizeEnemyVerticalSliceDamage
} = require('./EnemyDamageVerticalSlice.js');
const { defeatPlayer } = require('./PlayerDefeatRules.js');
const { tickCombatStatuses } = require('./CombatStatusTickRules.js');

class CombatStatusRuntime {
	constructor(options) {
		this.clock = options.clock || Date.now;
		this.creatures = options.creatures;
		this.players = options.players;
		this.vertical = options.vertical;
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
			if (!eligiblePlayer(player)) continue;
			const ticks = tickCombatStatuses(player.combat, now);
			const damage = totalTickDamage(ticks);
			let kavanah = null;
			if (damage > 0) {
				player.combat.health = Math.max(
					0,
					player.combat.health - damage
				);
				kavanah = this.vertical?.disruptKavanah(player, damage) || null;
				if (player.combat.health === 0) defeatPlayer(player, now);
			}
			if (ticks.length) {
				events.push({
					damage,
					kavanah,
					playerId: player.id,
					ticks
				});
			}
		}
		return events;
	}

	tickCreatures(now) {
		const events = [];
		for (const creature of this.creatures.creatures.values()) {
			if (creature.status !== 'active') continue;
			const ticks = tickCombatStatuses(creature, now);
			const requestedDamage = totalTickDamage(ticks);
			let damage = null;
			let verticalSlice = null;
			if (requestedDamage > 0) {
				damage = applyCombatStatusCreatureDamage(
					this.creatures,
					creature,
					requestedDamage,
					now
				);
				verticalSlice = finalizeEnemyVerticalSliceDamage(
					creature,
					connectedPlayerCount(this.players)
				);
			}
			if (ticks.length) {
				events.push({
					creatureId: creature.id,
					damage,
					requestedDamage,
					ticks,
					verticalSlice
				});
			}
		}
		return events;
	}
}

function eligiblePlayer(player) {
	return player.kind === 'human'
		&& player.combat.status === 'active';
}

function totalTickDamage(ticks) {
	return ticks.reduce((sum, event) => {
		return sum + Number(event.damage || 0);
	}, 0);
}

function connectedPlayerCount(players) {
	return [...players.values()].filter(player => {
		return player.kind === 'human'
			&& player.connected !== false;
	}).length || 1;
}

module.exports = {
	CombatStatusRuntime
};
