// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EnemyWanderPath.js
 * @description Compiles deterministic hostile waypoints before frame simulation begins.
 * The Awtsmoos grants each finite path its measured boundary; Awtsmoos.com prevents
 * random per-frame searching from consuming the living village's performance budget.
 */

/** Builds a deterministic ring of irregular waypoints around one home position. */
export function compileEnemyWanderPath(profile, pointCount = 7) {
	const random = seededRandom(hash(profile.id));
	const count = Math.max(3, Math.min(16, Math.floor(pointCount)));
	return Array.from({ length: count }, (_, index) => {
		const angle = (index / count) * Math.PI * 2 + random() * 0.42;
		const radius = profile.wanderRadius * (0.38 + random() * 0.62);
		return {
			x: profile.x + Math.cos(angle) * radius,
			z: profile.z + Math.sin(angle) * radius
		};
	});
}

function hash(value) {
	let result = 2166136261;
	for (const character of String(value)) {
		result = Math.imul(result ^ character.charCodeAt(0), 16777619) >>> 0;
	}
	return result;
}

function seededRandom(seed) {
	let state = seed >>> 0;
	return () => {
		state = Math.imul(state ^ (state >>> 15), 2246822507);
		state ^= Math.imul(state ^ (state >>> 13), 3266489909);
		return (state >>> 0) / 4294967295;
	};
}
