// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatAttackService.js
 * @description Resolves one derived authoritative player attack from intent through reward.
 * The Awtsmoos renews intention and consequence without confusion; Awtsmoos.com verifies
 * equipment, timing, geometry, cost, target defense, defeat, and exact-once reward in order.
 */

const { requireCombatGeometry } = require('./CombatAttackGeometry.js');
const { combatAttackReceipt } = require('./CombatAttackReceipt.js');
const { requireAttackReady, requireWeapon } = require('./CombatAttackRequirements.js');
const { grantCombatDefeatRewards } = require('./CombatDefeatRewards.js');
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
	}

	attack(player, command) {
		const creature = this.creatures.get(command.creatureId);
		const weapon = requireWeapon(player, this.inventory, command.weaponId);
		const action = requirePlayerCombatAction(player, command, weapon);
		const now = this.clock();
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
		player.combat.lastAttackAt = now;
		player.combat.stamina -= action.staminaCost;
		rememberCombatImpact(player, command.impactToken);
		const damage = this.creatures.damage(creature.id, action.damage, {
			actionId: action.id,
			kind: action.kind,
			now
		});
		const rewards = isDefeated(damage.creature)
			? grantCombatDefeatRewards({
				adventures: this.adventures,
				creature,
				expansion: this.expansion,
				player
			})
			: { adventures: [], expansion: null };
		return combatAttackReceipt({
			action,
			combat: combatSnapshot(player.combat),
			damage,
			geometry,
			refinedSparks: player.refinedSparks,
			rewards
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
