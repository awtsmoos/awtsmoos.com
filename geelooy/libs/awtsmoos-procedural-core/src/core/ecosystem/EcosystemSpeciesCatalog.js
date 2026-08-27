// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EcosystemSpeciesCatalog.js
 * @description Defines reusable renderer-neutral ecological roles without replacing specialist generators.
 * The Awtsmoos lets grass, reed, pine, cow, chicken, deer, wolf, fish, and hidden hostile seek a fitting place;
 * Awtsmoos.com stores ecological intent here while botany, tree, grass, and creature engines reveal each face.
 */

const SPECIES = Object.freeze([
	plant('meadow-grass', 'grass', 0.34, { moisture: [0.28, 0.86], sunlight: [0.45, 1], disturbance: [0, 0.7] }),
	plant('river-reed', 'wetland', 0.5, { moisture: [0.72, 1], riverProximity: [0.7, 1], sunlight: [0.35, 1] }),
	plant('flowering-shrub', 'shrub', 1.4, { moisture: [0.35, 0.85], sunlight: [0.35, 1], fertility: [0.4, 1] }),
	plant('forest-understory', 'shrub', 1.1, { canopy: [0.35, 0.9], shelter: [0.4, 1], moisture: [0.35, 0.85] }),
	plant('alpine-pine', 'tree', 4.2, { slope: [0, 0.75], moisture: [0.2, 0.7], sunlight: [0.4, 1] }),
	creature('cow', 'grazer', 3.6, 'herd', { sunlight: [0.35, 1], moisture: [0.25, 0.75], disturbance: [0.05, 0.65] }),
	creature('sheep', 'grazer', 2.8, 'herd', { sunlight: [0.35, 1], disturbance: [0.05, 0.72] }),
	creature('goat', 'browser', 2.5, 'herd', { slope: [0.05, 0.9], shelter: [0.2, 1] }),
	creature('chicken', 'forager', 1.4, 'flock', { disturbance: [0.2, 0.85], sunlight: [0.25, 1] }),
	creature('deer', 'herbivore', 3.8, 'herd', { shelter: [0.25, 1], moisture: [0.25, 0.85], disturbance: [0, 0.55] }),
	creature('fox', 'mesopredator', 9, 'territory', { shelter: [0.45, 1], disturbance: [0, 0.45] }),
	creature('wolf', 'predator', 13, 'pack', { shelter: [0.4, 1], disturbance: [0, 0.35] }),
	creature('songbird', 'aerial', 1.5, 'flock', { canopy: [0.25, 1], shelter: [0.25, 1] }),
	creature('river-fish', 'aquatic', 1, 'school', { riverProximity: [0.9, 1], moisture: [0.9, 1] }),
	creature('klipah-guardian', 'hostile', 14, 'territory', { disturbance: [0, 0.45], shelter: [0.45, 1] })
]);

const BY_ID = new Map(SPECIES.map(species => [species.id, species]));

export function ecosystemSpecies(id) {
	const species = BY_ID.get(String(id));
	if (!species) throw new Error(`Unknown ecosystem species: ${id}`);
	return species;
}

export function listEcosystemSpecies(kind = null) {
	return SPECIES.filter(species => !kind || species.kind === kind);
}

function plant(id, role, spacing, habitat) {
	return freeze({ habitat, id, kind: 'plant', role, spacing, weight: 1 });
}

function creature(id, role, spacing, grouping, habitat) {
	return freeze({ grouping, habitat, id, kind: 'creature', role, spacing, weight: 1 });
}

function freeze(value) {
	return Object.freeze({ ...value, habitat: Object.freeze({ ...(value.habitat || {}) }) });
}
