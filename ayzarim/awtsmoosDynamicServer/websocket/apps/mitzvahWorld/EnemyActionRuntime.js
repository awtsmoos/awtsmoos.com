// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyActionRuntime.js
 * @description Advances hostile telegraph, threat selection, impact, recovery, and cancellation.
 * The Awtsmoos renews each phase beneath one clock; Awtsmoos.com ensures no action resolves
 * before warning, after stagger, outside region, beyond range, more than once, or by damage alone.
 */

const { applyCreaturePopulationScale } = require('./CreaturePopulationScaling.js');
const { nearestActivePlayer } = require('./CreatureBrain.js');
const { enemyAction } = require('./EnemyActionCatalog.js');
const { resolveEnemyAction } = require('./EnemyActionResolver.js');
const { selectEnemyAction } = require('./EnemyActionSelector.js');
const {
	advanceEnemyAction,
	beginEnemyAction,
	clearEnemyAction,
	resolveEnemyAction: markResolved
} = require('./EnemyActionState.js');

class EnemyActionRuntime {
	constructor(options) {
		this.clock = options.clock || Date.now;
		this.creatures = options.creatures;
		this.defense = options.defense;
		this.players = options.players;
		this.vertical = options.vertical;
		this.step = 0;
	}

	tick() {
		this.step += 1;
		const now = this.clock();
		for (const creature of this.creatures.creatures.values()) {
			applyCreaturePopulationScale(creature, this.players);
			this.updateCreature(creature, now);
		}
	}

	updateCreature(creature, now) {
		if (!eligibleCreature(creature)) return clearEnemyAction(creature);
		if (Number.isFinite(creature.staggeredUntil)
			&& now <= creature.staggeredUntil) {
			return clearEnemyAction(creature);
		}
		const target = this.targetFor(creature, now);
		if (!target) return clearEnemyAction(creature);
		const state = advanceEnemyAction(creature, now);
		if (!state.actionId) return this.begin(creature, target, now);
		if (state.phase !== 'active' || state.resolved) return;
		const action = enemyAction(state.actionId);
		if (!action) return clearEnemyAction(creature);
		creature.lastActionResult = resolveEnemyAction({
			action,
			creature,
			creatures: this.creatures,
			defense: this.defense,
			now,
			players: this.players,
			target,
			vertical: this.vertical
		});
		markResolved(creature);
	}

	targetFor(creature, now) {
		const active = [...this.players.values()].filter(player => {
			return player.kind === 'human' && player.combat?.status === 'active';
		});
		const target = this.vertical?.threat?.target(creature, active)
			|| nearestActivePlayer(creature, this.players);
		if (target) {
			this.vertical?.threat?.add(
				creature,
				target.id,
				'proximity',
				1,
				`${creature.id}:proximity:${Math.floor(now / 1000)}`
			);
		}
		return target;
	}

	begin(creature, target, now) {
		const actionId = selectEnemyAction(creature, target, this.step);
		const action = enemyAction(actionId);
		if (!action) return;
		beginEnemyAction(creature, actionId, action, target.id, now);
		if (!creature.phase) creature.phase = 'measured-guard';
	}
}

function eligibleCreature(creature) {
	return creature.status === 'active'
		&& creature.temperament === 'hostile'
		&& creature.attackDamage > 0;
}

module.exports = {
	EnemyActionRuntime
};
