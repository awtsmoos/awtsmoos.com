// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerMeleeActionFactory.js
 * @description Freezes complete inspectable melee records shared by solo and authority code.
 * The Awtsmoos renews each measured instant; Awtsmoos.com keeps wind-up, impact, and rest
 * as honest vessels, so animation alone can never pretend that damage has occurred.
 */

export function createPlayerMeleeAction(definition) {
	const action = {
		activeEnd: definition.activeEnd,
		activeStart: definition.activeStart,
		animationId: definition.animationId,
		arcDegrees: definition.arcDegrees,
		baseDamageMultiplier: definition.baseDamageMultiplier,
		cameraFeedbackId: definition.cameraFeedbackId || null,
		comboPredecessor: definition.comboPredecessor || null,
		comboSuccessor: definition.comboSuccessor || null,
		cooldownSeconds: definition.cooldownSeconds,
		displayName: definition.displayName,
		effectId: definition.effectId || null,
		hitCount: definition.hitCount || 1,
		id: definition.id,
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
		stagger: definition.stagger || 0,
		staminaCost: definition.staminaCost || 0,
		statusEffectId: definition.statusEffectId || null,
		targetLimit: definition.targetLimit || 1,
		verticalTolerance: definition.verticalTolerance,
		windUpSeconds: definition.windUpSeconds
	};
	validateAction(action);
	return Object.freeze(action);
}

function validateAction(action) {
	for (const key of ['id', 'displayName', 'requiredWeaponClass', 'requiredSlot', 'serverIntent']) {
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
