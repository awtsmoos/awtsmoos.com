// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file PlayerMeleeHitGeometry.js
 * @description Confirms active-time, horizontal arc, reach, and vertical tolerance purely.
 * The Awtsmoos creates nearness without confusion; Awtsmoos.com demands measured geometry,
 * so neither a button, animation, distant target, nor cancelled deed can counterfeit a hit.
 */

export function meleePhase(action, elapsedSeconds) {
	if (elapsedSeconds < action.activeStart) return 'wind-up';
	if (elapsedSeconds <= action.activeEnd) return 'active';
	if (elapsedSeconds <= action.activeEnd + action.recoverySeconds) return 'recovery';
	return 'complete';
}

export function confirmMeleeHit(action, attacker, target, elapsedSeconds) {
	if (meleePhase(action, elapsedSeconds) !== 'active') return rejection('INACTIVE_WINDOW');
	if (!attacker || !target) return rejection('POSITION_REQUIRED');
	const deltaX = target.x - attacker.x;
	const deltaY = target.y - attacker.y;
	const deltaZ = target.z - attacker.z;
	if (Math.abs(deltaY) > action.verticalTolerance) return rejection('VERTICAL_TOLERANCE');
	const distance = Math.hypot(deltaX, deltaZ);
	if (distance > action.range) return rejection('OUT_OF_RANGE', { distance });
	const facingX = Math.sin(attacker.facingRadians || 0);
	const facingZ = Math.cos(attacker.facingRadians || 0);
	const denominator = Math.max(distance, Number.EPSILON);
	const cosine = clamp((facingX * deltaX + facingZ * deltaZ) / denominator, -1, 1);
	const angleDegrees = Math.acos(cosine) * 180 / Math.PI;
	if (angleDegrees > action.arcDegrees / 2) return rejection('OUTSIDE_ARC', { angleDegrees });
	return Object.freeze({ accepted: true, angleDegrees, distance, reason: 'CONFIRMED' });
}

function rejection(reason, details = {}) {
	return Object.freeze({ accepted: false, reason, ...details });
}

function clamp(value, minimum, maximum) {
	return Math.min(maximum, Math.max(minimum, value));
}
