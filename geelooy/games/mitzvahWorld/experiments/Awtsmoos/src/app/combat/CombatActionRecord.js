// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CombatActionRecord.js
 * @description Freezes one inspectable combat covenant shared by casting and melee.
 * The Awtsmoos renews intention and boundary in one light; Awtsmoos.com lets every
 * finite action reveal timing, geometry, authority, cost, feedback, and succession.
 */
export function combatActionRecord(value) {
	return Object.freeze({
		activeEnd: finite(value.activeEnd, value.windup + 0.12),
		activeStart: finite(value.activeStart, value.windup),
		animation: value.animation || value.id,
		arcDegrees: finite(value.arcDegrees, 20),
		baseDamageMultiplier: finite(value.baseDamageMultiplier, 1),
		cameraFeedback: value.cameraFeedback || null,
		comboPredecessor: value.comboPredecessor || null,
		comboSuccessor: value.comboSuccessor || null,
		cooldown: finite(value.cooldown, 0.8),
		displayName: value.displayName || value.id,
		effectId: value.effectId || null,
		hitCount: Math.max(1, finite(value.hitCount, 1)),
		id: value.id,
		interruptible: value.interruptible !== false,
		knockback: finite(value.knockback, 0),
		movementAllowance: finite(value.movementAllowance, 0),
		range: finite(value.range, 3),
		recovery: finite(value.recovery, 0.25),
		requiredSlot: value.requiredSlot || null,
		requiredWeaponClass: value.requiredWeaponClass || null,
		rotationAllowance: finite(value.rotationAllowance, 0),
		serverIntent: value.serverIntent || 'combat-action',
		soundId: value.soundId || null,
		stagger: finite(value.stagger, 0),
		staminaCost: finite(value.staminaCost, 0),
		statusEffect: value.statusEffect || null,
		targetLimit: Math.max(1, finite(value.targetLimit, 1)),
		type: value.type || 'melee',
		verticalTolerance: finite(value.verticalTolerance, 2),
		windup: finite(value.windup, 0.2),
		...value
	});
}

function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}
