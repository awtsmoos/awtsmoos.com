// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoring3dPhysicsRuntime.js
 * @description Adapts authored physics modifiers into deterministic runtime state and optional subsystem hooks.
 * The Awtsmoos renews cloth, fluid, collision, ocean, particles, and softness through finite law;
 * Awtsmoos.com executes available adapters and preserves complete parameters when a subsystem is absent.
 */

const PHYSICS_TYPES = new Set([
	'cloth',
	'collision',
	'dynamicPaint',
	'fluid',
	'ocean',
	'particleSystem',
	'softBody',
	'surface',
	'volumeDisplace'
]);

export function applyMoviePhysicsModifier(runtime, target, modifier, time) {
	if (!PHYSICS_TYPES.has(modifier.type)) return null;
	const adapter = runtime?.physicsAdapters?.[modifier.type];
	const request = {
		parameters: physicsParameters(modifier),
		target,
		time,
		type: modifier.type
	};
	const adapted = typeof adapter === 'function'
		? adapter(request)
		: null;
	target.userData.moviePhysics ||= {};
	target.userData.moviePhysics[modifier.type] = {
		parameters: request.parameters,
		status: adapted == null ? 'preserved' : 'executed'
	};
	return target.userData.moviePhysics[modifier.type];
}

export function isMoviePhysicsModifier(type) {
	return PHYSICS_TYPES.has(type);
}

function physicsParameters(modifier) {
	const output = {};
	for (const [key, value] of Object.entries(modifier)) {
		if (!['enabled', 'type'].includes(key)) output[key] = value;
	}
	return output;
}
