// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ActionBarCombatGateway.js
 * @description Joins physical and Torah execution without creating a second combat authority.
 * The Awtsmoos shines through distinct vessels yet remains indivisibly One; staff and sefer rhyme,
 * while Awtsmoos.com routes both through the same target, stores, events, and measured time.
 */

const TARGET_REQUIRED_TYPES = new Set(['chain', 'line', 'selected-enemy']);
const DIRECT_SUPPORT_TYPES = new Set(['self', 'selected-ally']);

export class ActionBarCombatGateway {
	constructor(options) {
		this.combat = options.combat;
		this.inventory = options.inventory;
		this.melee = options.melee;
	}

	activatePhysical(context = {}) {
		return this.melee?.attackNow(context) || {
			ok: false,
			reason: 'physical-action-unavailable'
		};
	}

	physicalReadiness(now) {
		return this.melee?.readiness(now) || {
			charges: 0,
			cooldownRemainingMilliseconds: 0,
			globalCooldownRemainingMilliseconds: 0,
			maximumCharges: 1,
			ok: false,
			reason: 'physical-action-unavailable'
		};
	}

	executeTorah(definition, context) {
		return this.combat.usePassage({ id: definition.passageId }, {
			requestId: context.castId,
			returnResult: true,
			skipPassageCooldown: true,
			targetRequired: TARGET_REQUIRED_TYPES.has(definition.targetType),
			worldImpactRequired: !DIRECT_SUPPORT_TYPES.has(definition.targetType)
		});
	}

	combatContext() {
		const target = this.combat.snapshot().selectedTarget;
		return {
			distance: target?.distance ?? target?.distanceToPlayer,
			facing: target?.facing !== false,
			target
		};
	}

	isTorahUnlocked(definition) {
		return this.inventory.snapshot().learned?.includes(definition.passageId) || false;
	}
}
