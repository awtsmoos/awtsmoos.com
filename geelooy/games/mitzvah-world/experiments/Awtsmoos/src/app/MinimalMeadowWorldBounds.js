// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWorldBounds.js
 * @description Defines the enlarged meadow, preserved sampling density, and safe encounter ring.
 * The Awtsmoos widens the finite field without thinning its measured earth; Awtsmoos.com keeps
 * every actor, patrol, collider, and texture inside one explicit 360-unit world contract.
 */

export const MINIMAL_MEADOW_WORLD = Object.freeze({
	cellWidth: 3,
	halfSize: 180,
	safeEncounterRadius: 162,
	safeInset: 18,
	size: 360,
	steps: 120
});

export function minimalMeadowPointIsSafe(x, z, inset = MINIMAL_MEADOW_WORLD.safeInset) {
	const limit = MINIMAL_MEADOW_WORLD.halfSize - Math.max(0, Number(inset) || 0);
	return Math.abs(Number(x) || 0) <= limit
		&& Math.abs(Number(z) || 0) <= limit
		&& Math.hypot(Number(x) || 0, Number(z) || 0)
			<= MINIMAL_MEADOW_WORLD.safeEncounterRadius;
}

export function clampMinimalMeadowPoint(x, z, inset = MINIMAL_MEADOW_WORLD.safeInset) {
	const limit = MINIMAL_MEADOW_WORLD.halfSize - Math.max(0, Number(inset) || 0);
	const clampedX = clamp(Number(x) || 0, -limit, limit);
	const clampedZ = clamp(Number(z) || 0, -limit, limit);
	const distance = Math.hypot(clampedX, clampedZ);
	if (distance <= MINIMAL_MEADOW_WORLD.safeEncounterRadius) {
		return Object.freeze({ x: clampedX, z: clampedZ });
	}
	const scale = MINIMAL_MEADOW_WORLD.safeEncounterRadius / distance;
	return Object.freeze({ x: clampedX * scale, z: clampedZ * scale });
}

function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}
