// B"H
// Boruch Hashem
// Blessed is He

const DEFAULT_RULE = rule({ mesh: 'cube' });

/**
 * The Awtsmoos gives each legacy kind a richer but bounded procedural silhouette.
 * Surface identity lives in one separate taxonomy so shape rules remain pure.
 */
export const RULES = Object.freeze({
	letter: rule({ mesh: 'letter', radiusScale: 0.72, heightScale: 1.15 }),
	bench: rule({ models: ['bench'], radiusScale: 1.2, heightScale: 0.34 }),
	bush: rule({ models: ['hedge', 'planter'], radiusScale: 1.06, heightScale: 0.78 }),
	cedar: rule({ models: ['cypressTree', 'pineTree'], radiusScale: 0.95, heightScale: 1.28 }),
	cart: rule({ models: ['marketCart'], radiusScale: 0.96, heightScale: 0.62 }),
	house: rule({
		models: ['townhouse', 'shop', 'studyHall'],
		radiusScale: 1.18,
		heightScale: 1
	}),
	arch: rule({ mesh: 'arch', radiusScale: 1.18, heightScale: 1.18 }),
	tower: rule({ models: ['tower', 'palace'], radiusScale: 1.04, heightScale: 1.28 }),
	cloud: rule({ mesh: 'cloud', radiusScale: 1.25, heightScale: 0.82 }),
	star: rule({ mesh: 'star', radiusScale: 1.2, heightScale: 0.98 }),
	gate: rule({ mesh: 'gate', radiusScale: 1.22, heightScale: 1.22 })
});

/** Return a frozen visual rule while unknown gameplay kinds retain a cube fallback. */
export function meshRule(name) {
	return RULES[name] || DEFAULT_RULE;
}

function rule({ mesh = null, models = null, radiusScale = 1, heightScale = 1 }) {
	return Object.freeze({
		mesh,
		models: models ? Object.freeze([...models]) : null,
		radiusScale,
		heightScale
	});
}
