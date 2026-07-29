// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerMeleeActionFactory.js
 * @description Freezes timed melee records enriched by canonical combat identity.
 * The Awtsmoos renews each wind-up, impact, and rest without letting animation invent force;
 * Awtsmoos.com joins client responsiveness to shared affinity truth along one inspectable course.
 */

import { playerCombatDefinition } from '../affinity/CombatDefinitionCatalog.js';

export function createPlayerMeleeAction(definition) {
	const combat = playerCombatDefinition(definition.id);
	if (!combat) throw new Error(`MELEE_COMBAT_DEFINITION_REQUIRED:${definition.id}`);
	const action = {
		activeEnd: definition.activeEnd,
		activeStart: definition.activeStart,
		affinityId: combat.affinityId,
		animationId: definition.animationId,
		arcDegrees: definition.arcDegrees,
		baseDamageMultiplier: definition.baseDamageMultiplier,
		cameraFeedbackId: definition.cameraFeedbackId || null,
		canonicalActionId: combat.id,
		comboPredecessor: definition.comboPredecessor || null,
		comboSuccessor: definition.comboSuccessor || null,
		cooldownSeconds: definition.cooldownSeconds,
		danger: combat.danger,
		displayName: definition.displayName,
		effectId: definition.effectId || null,
		elementId: combat.elementId,
		englishName: combat.englishName,
		guardDamage: combat.guardDamage || 0,
		hebrewName: combat.hebrewName,
		hitCount: definition.hitCount || 1,
		id: definition.id,
		interruptForce: combat.interruptForce || 0,
		interruptible: definition.interruptible !== false,
		knockback: definition.knockback || 0,
		movementAllowance: definition.movementAllowance || 0,
		range: definition.range,
		recoverySeconds: definition.recoverySeconds,
		requiredSlot: definition.requiredSlot,
		requiredWeaponClass: definition.requiredWeaponClass,
		rotationAllowance: definition.rotationAllowance || 0,
		serverIntent: definition.serverIntent,
		soundId: definition.soundId || null,
		stagger: combat.stagger || definition.stagger || 0,
		staminaCost: definition.staminaCost || 0,
		statusEffectId: definition.statusEffectId || null,
		tags: Object.freeze([...(combat.tags || [])]),
		targetLimit: definition.targetLimit || 1,
		verticalTolerance: definition.verticalTolerance,
		windUpSeconds: definition.windUpSeconds
	};
	validateAction(action);
	return Object.freeze(action);
}

function validateAction(action) {
	for (const key of [
		'id',
		'canonicalActionId',
		'displayName',
		'affinityId',
		'elementId',
		'requiredWeaponClass',
		'requiredSlot',
		'serverIntent'
	]) {
		if (!action[key]) throw new Error(`MELEE_ACTION_FIELD_REQUIRED:${key}`);
	}
	if (action.activeStart < action.windUpSeconds || action.activeEnd < action.activeStart) {
		throw new Error(`MELEE_ACTION_WINDOW_INVALID:${action.id}`);
	}
	for (const key of ['range', 'arcDegrees', 'verticalTolerance', 'cooldownSeconds']) {
		if (!Number.isFinite(action[key]) || action[key] <= 0) {
			throw new Error(`MELEE_ACTION_NUMBER_INVALID:${action.id}:${key}`);
		}
	}
}
