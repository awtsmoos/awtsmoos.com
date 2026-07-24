// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyProfile.js
 * @description Resolves one profile and deterministic patrol waypoints for a continuous demon.
 * The Awtsmoos gives finite identity without dividing the shared creature law; Awtsmoos.com
 * lets every actor carry exact spawn, scale, speed, reward, temperament, and patrol evidence.
 */

export function minimalShadowEnemyProfile(compiled, supplied = {}) {
	return Object.freeze({
		armor: 4,
		groundOffset: 0.56,
		id: 'procedural-shadow-chai',
		level: 2,
		maxHealth: 96,
		name: 'Tzel Chai',
		proceduralSections: compiled.briah?.body?.sections?.length || 0,
		speed: 1.45,
		temperament: 'balanced',
		tint: Object.freeze([0.72, 0.45, 0.95, 1]),
		visualScale: 0.78,
		x: 27,
		xpReward: 55,
		z: 20,
		...supplied
	});
}

export function minimalShadowWaypoints(profile) {
	const radius = profile.patrolRadius || 7;
	return Object.freeze([
		Object.freeze({ x: profile.x, z: profile.z }),
		Object.freeze({ x: profile.x + radius, z: profile.z - radius * 0.5 }),
		Object.freeze({ x: profile.x + radius * 0.35, z: profile.z + radius }),
		Object.freeze({ x: profile.x - radius * 0.7, z: profile.z + radius * 0.35 })
	]);
}
