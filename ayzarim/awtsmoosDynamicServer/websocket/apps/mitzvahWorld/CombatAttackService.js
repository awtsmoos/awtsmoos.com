// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatAttackService.js
 * @description Resolves one authoritative attack through validation, Kavanah, damage, and reward.
 * The Awtsmoos renews intention and consequence without confusion; Awtsmoos.com verifies
 * equipment, timing, geometry, cost, control, typed damage, interruption, posture, phase, and reward.
 */

const { requireCombatGeometry } = require('./CombatAttackGeometry.js');
const {
	consumeAttackKavanah,
	requireAttackKavanah
} = require('./CombatAttackKavanah.js');
const { combatAttackReceipt } = require('./CombatAttackReceipt.js');
const { requireAttackReady, requireWeapon } = require('./CombatAttackRequirements.js');
const { grantCombatDefeatRewards } = require('./CombatDefeatRewards.js');
const { resolveEnemyInterrupt } = require('./CombatInterruptRules.js');
const { combatSnapshot } = require('./CombatState.js');
const {
	rememberCombatImpact,
	requirePlayerCombatAction
} = require('./PlayerCombatActionValidation.js');

class CombatAttackService {
	constructor(options) {
		this.adventures = options.adventures;
		this.clock = options.clock || Date.now;
		this.creatures = options.creatures;
		this.expansion = options.expansion;
		this.inventory = options.inventory;
		this.vertical = options.vertical;
	}

	attack(player, command) {
		const now = this.clock();
		const creature = this.creatures.get(command.creatureId);
		const weapon = requireWeapon(player, this.inventory, command.weaponId);
		const action = requirePlayerCombatAction(player, command, weapon, now);
		requireAttackReady({
			action,
			creature,
			intent: command.intent,
			inventory: this.inventory,
			now,
			player,
			weaponId: command.weaponId
		});
		const geometry = requireCombatGeometry(player, creature, action);
		const preparedKavanah = requireAttackKavanah(player, action);
		player.combat.lastAttackAt = now;
		player.combat.stamina -= action.staminaCost;
		rememberCombatImpact(player, command.impactToken, now);
		const damageOutcome = this.creatures.damage(creature.id, action.damage, {
			action,
			actionId: action.id,
			kavanah: preparedKavanah,
			kind: action.kind,
			now,
			serverContextTags: [],
			sourceActorId: player.id
		});
		const kavanah = consumeAttackKavanah(player, preparedKavanah, now);
		const interruption = resolveEnemyInterrupt(
			creature,
			action,
			now,
			player.id
		);
		const damage = {
			...damageOutcome,
			creature: this.creatures.snapshot(creature),
			interruption
		};
		const rewards = isDefeated(damage.creature)
			? grantCombatDefeatRewards({
				adventures: this.adventures,
				creature,
				expansion: this.expansion,
				player
			})
			: { adventures: [], expansion: null };
		const verticalSlice = this.vertical.afterAttack(
			player,
			creature,
			action,
			damage,
			command
		);
		return combatAttackReceipt({
			action,
			combat: combatSnapshot(player.combat),
			damage,
			geometry,
			kavanah,
			refinedSparks: player.refinedSparks,
			rewards,
			verticalSlice
		});
	}
}

function isDefeated(snapshot) {
	return snapshot.status === 'defeated'
		|| snapshot.status === 'harvestable';
}

module.exports = {
	CombatAttackService
};
