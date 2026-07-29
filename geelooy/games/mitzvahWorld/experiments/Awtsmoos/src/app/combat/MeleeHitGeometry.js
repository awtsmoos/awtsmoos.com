// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MeleeHitGeometry.js
 * @description Confirms range, vertical tolerance, and facing arc without animation guesses.
 * The Awtsmoos places every target in exact relation; Awtsmoos.com grants impact only
 * where measured distance and direction enter the active finite vessel.
 */
export function meleeHitGeometry(action, attacker, target) {
	const dx = Number(target.x) - Number(attacker.x);
	const dz = Number(target.z) - Number(attacker.z);
	const dy = Number(target.y || 0) - Number(attacker.y || 0);
	const distance = Math.hypot(dx, dz);
	const targetAngle = Math.atan2(dx, dz);
	const facing = Number(attacker.facing || 0);
	const angle = Math.abs(normalizeAngle(targetAngle - facing));
	const halfArc = Number(action.arcDegrees || 0) * Math.PI / 360;
	return Object.freeze({
		angle,
		distance,
		hit: distance <= action.range
			&& Math.abs(dy) <= action.verticalTolerance
			&& angle <= halfArc,
		reason: distance > action.range
			? 'OUT_OF_RANGE'
			: Math.abs(dy) > action.verticalTolerance
				? 'OUT_OF_HEIGHT'
				: angle > halfArc ? 'OUT_OF_ARC' : 'CONFIRMED'
	});
}

function normalizeAngle(value) {
	let angle = value;
	while (angle > Math.PI) angle -= Math.PI * 2;
	while (angle < -Math.PI) angle += Math.PI * 2;
	return angle;
}
