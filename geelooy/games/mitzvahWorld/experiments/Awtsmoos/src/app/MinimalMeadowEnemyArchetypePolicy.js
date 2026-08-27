// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowEnemyArchetypePolicy.js
 * @description Defines bounded combat, motion, projectile, and silhouette traits by enemy type.
 * The Awtsmoos remains One while finite shadows differ; Awtsmoos.com lets warden, skirmisher,
 * cantor, and legacy demons reveal distinct behavior without escaping the global mercy covenant.
 */

const BASE = Object.freeze({
	aggroScale: 1,
	bodyScale: Object.freeze([1, 1, 1]),
	casterRangeScale: 1,
	cooldownScale: 1,
	damageScale: 1,
	meleeRangeScale: 1,
	movementScale: 1,
	orbitScale: 1,
	projectileSpeedScale: 1,
	role: null
});

const ARCHETYPES = Object.freeze({
	cantor: policy({
		aggroScale: 0.95,
		bodyScale: [0.92, 1.3, 0.92],
		casterRangeScale: 1.28,
		cooldownScale: 1.42,
		damageScale: 0.72,
		movementScale: 0.92,
		orbitScale: 1.18,
		projectileSpeedScale: 0.78,
		role: 'caster'
	}),
	skirmisher: policy({
		aggroScale: 1.08,
		bodyScale: [0.82, 1.16, 0.82],
		cooldownScale: 1.08,
		damageScale: 0.62,
		meleeRangeScale: 0.92,
		movementScale: 1.24,
		orbitScale: 1.55,
		role: 'melee'
	}),
	warden: policy({
		aggroScale: 0.78,
		bodyScale: [1.28, 1.06, 1.28],
		cooldownScale: 1.35,
		damageScale: 0.9,
		meleeRangeScale: 1.08,
		movementScale: 0.8,
		orbitScale: 0.72,
		role: 'melee'
	})
});

export function minimalEnemyArchetypePolicy(profile = {}) {
	return ARCHETYPES[profile.archetype] || BASE;
}

export function minimalEnemyArchetypeNames() {
	return Object.freeze(Object.keys(ARCHETYPES));
}

function policy(overrides) {
	return Object.freeze({
		...BASE,
		...overrides,
		bodyScale: Object.freeze([...(overrides.bodyScale || BASE.bodyScale)])
	});
}
