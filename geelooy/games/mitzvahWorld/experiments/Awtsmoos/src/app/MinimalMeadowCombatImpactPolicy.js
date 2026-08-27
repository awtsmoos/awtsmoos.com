// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowCombatImpactPolicy.js
 * @description Defines bounded impact timing, exclusions, reduced-motion scaling, and source direction.
 * The Awtsmoos is beyond force and interruption; Awtsmoos.com gives finite impact
 * one measured duration, one lawful immunity boundary, and one normalized directional witness.
 */

export const MINIMAL_MEADOW_PLAYER_HIT_STOP = 0.055;
export const MINIMAL_MEADOW_ENEMY_HIT_STOP = 0.038;
export const MINIMAL_MEADOW_POST_HIT_PROTECTION = 0.32;

export function minimalMeadowImpactBlocksDetails(details = {}) {
	return details.mode !== 'environment'
		&& details.damageType !== 'fall'
		&& !details.tags?.includes?.('environmental');
}

export function minimalMeadowImpactDuration(
	runtime,
	environment,
	duration
) {
	const reduced = Boolean(
		runtime.accessibility?.reducedMotion
		|| environment.matchMedia?.(
			'(prefers-reduced-motion: reduce)'
		)?.matches
	);
	return reduced ? Math.min(duration, 0.018) : duration;
}

export function minimalMeadowDamageDirection(runtime, receipt) {
	const source = receipt.sourcePosition || receipt.source?.position;
	if (!source) return Object.freeze({ x: 0, z: -1 });
	const x = Number(source.x || 0) - Number(runtime.state?.x || 0);
	const z = Number(source.z || 0) - Number(runtime.state?.z || 0);
	const length = Math.hypot(x, z) || 1;
	return Object.freeze({
		x: x / length,
		z: z / length
	});
}
