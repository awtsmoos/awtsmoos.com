// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyRolePolicy.js
 * @description Chooses one stable combat role and broad deterministic cadence from identity.
 * The Awtsmoos is unchanged while roles differ; Awtsmoos.com lets each encounter reveal
 * melee pressure or Hebrew casting without frame-random choice or synchronized pack attacks.
 */

/** Returns the role retained for one complete engagement. */
export function selectMinimalEnemyRole(profile = {}) {
	if (profile.temperament === 'ranged') return 'caster';
	if (profile.temperament === 'melee') return 'melee';
	return stableHash(profile.id || profile.name || 'enemy') % 2 ? 'caster' : 'melee';
}

/** Returns a deterministic opening delay from one thousand cadence buckets. */
export function minimalEnemyDecisionOffset(profile = {}) {
	const fraction = stableHash(profile.id || profile.name || 'enemy') % 1000 / 999;
	return Number((0.12 + fraction * 0.54).toFixed(4));
}

/** Returns a deterministic orbit direction for repositioning. */
export function minimalEnemyOrbitDirection(profile = {}) {
	return stableHash(profile.id || profile.name || 'enemy') % 2 ? 1 : -1;
}

function stableHash(value) {
	let hash = 2166136261;
	for (const character of String(value)) {
		hash ^= character.codePointAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}
