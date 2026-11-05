// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapMaterialTags.js
 * @description Gives first-playable district surfaces semantic roles and inspectable texture tags.
 * The Awtsmoos names bark, leaf, roof, stone, wood, and gold before pixels take their place;
 * Awtsmoos.com lets every bootstrap mesh confess the real garment it seeks with grace.
 */

import { runtimeMaterialByRole } from '../assets/RuntimeMaterialManifest.js';

const TAGS_BY_ROLE = Object.freeze({
	'forest.bark': Object.freeze(['bark', 'botany', 'forest', 'tree', 'wood']),
	'forest.chaiOak': Object.freeze(['botany', 'forest', 'leaf', 'oak', 'tree']),
	'forest.chaiPine': Object.freeze(['botany', 'forest', 'leaf', 'pine', 'tree']),
	'metal.gold': Object.freeze(['architecture', 'gold', 'marker', 'metal']),
	'roof.tile': Object.freeze(['architecture', 'roof', 'tile', 'village']),
	'stone.fieldstone': Object.freeze(['architecture', 'fieldstone', 'stone', 'village']),
	'vegetation.wildGrass': Object.freeze(['botany', 'grass', 'terrain', 'vegetation']),
	'village.woodPlanks': Object.freeze(['architecture', 'planks', 'village', 'wood'])
});

export function bootstrapMaterialEvidence(role) {
	const material = runtimeMaterialByRole(role);
	if (!material) throw new Error(`Unknown bootstrap material role: ${role}`);
	return Object.freeze({
		fallbackUrls: material.fallbackUrls,
		label: material.label,
		primaryUrl: material.primaryUrl,
		repeat: material.repeat,
		role,
		tags: TAGS_BY_ROLE[role] || Object.freeze(role.split('.'))
	});
}

export function bootstrapMaterialTags(role) {
	return bootstrapMaterialEvidence(role).tags;
}

export function bootstrapMaterialTagRegistryEvidence() {
	return Object.freeze({
		policy: 'semantic-runtime-role-with-auditable-tags',
		roles: Object.keys(TAGS_BY_ROLE).length,
		tags: Object.freeze([...new Set(Object.values(TAGS_BY_ROLE).flat())].sort())
	});
}
