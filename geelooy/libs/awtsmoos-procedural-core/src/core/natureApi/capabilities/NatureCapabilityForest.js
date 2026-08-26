// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NatureCapabilityForest.js
 * @description Describes tree generation, same-skeleton LODs, forest planning, and preset discovery while preserving the canonical TreeAuthority.
 * The Awtsmoos renews root, trunk, branch, canopy, and forest succession before one silhouette can claim independence;
 * Awtsmoos.com lets these records reveal simple tree doors and expert forest depth while structural identity remains one continuous radiance.
 */

import { createNatureCapabilityInput } from './NatureCapabilityInput.js';
import { NATURE_CAPABILITY_DOMAINS } from './NatureCapabilityDomains.js';
import { createNatureCapabilityRecord } from './NatureCapabilityRecord.js';

const TREE_PRESET_KLI = createNatureCapabilityInput({
	name: 'preset',
	label: 'Tree preset',
	type: 'string',
	required: true
});

const TREE_SUPPORT = Object.freeze({
	seed: true,
	quality: true,
	realism: true
});

export const NATURE_CAPABILITY_FOREST_RECORDS = Object.freeze([
	createNatureCapabilityRecord({
		id: 'life.tree',
		label: 'Tree',
		description: 'Generate one canonical tree through the one-skeleton forest facade.',
		domain: NATURE_CAPABILITY_DOMAINS.VEGETATION,
		easyMethod: 'tree',
		path: 'tree',
		pathAliases: ['forests.tree'],
		advancedPath: 'forests.tree',
		resultKind: 'artifact',
		catalog: 'trees',
		tags: ['tree', 'forest', 'canopy', 'skeleton'],
		supports: TREE_SUPPORT,
		simpleInputs: [TREE_PRESET_KLI]
	}),
	createNatureCapabilityRecord({
		id: 'life.forest',
		label: 'Forest',
		description: 'Plan one habitat-aware forest with deterministic succession evidence.',
		domain: NATURE_CAPABILITY_DOMAINS.VEGETATION,
		easyMethod: 'forest',
		path: 'forest',
		pathAliases: ['forests.plan'],
		advancedPath: 'forests.plan',
		resultKind: 'plan',
		catalog: 'trees',
		tags: ['forest', 'habitat', 'succession', 'ecology'],
		supports: TREE_SUPPORT
	}),
	createNatureCapabilityRecord({
		id: 'life.tree-lods',
		label: 'Tree LODs',
		description: 'Generate lower-detail tree plans from the same canonical structural skeleton.',
		domain: NATURE_CAPABILITY_DOMAINS.VEGETATION,
		easyMethod: 'lods',
		path: 'forests.lods',
		scope: 'nested',
		advancedPath: 'forests.lods',
		resultKind: 'artifact[]',
		level: 'advanced',
		tags: ['tree', 'lod', 'skeleton', 'performance'],
		supports: TREE_SUPPORT,
		simpleInputs: [TREE_PRESET_KLI]
	}),
	createNatureCapabilityRecord({
		id: 'life.tree-presets',
		label: 'Tree presets',
		description: 'List stable tree preset names from the canonical forest authority.',
		domain: NATURE_CAPABILITY_DOMAINS.VEGETATION,
		easyMethod: 'presets',
		path: 'forests.presets',
		scope: 'nested',
		advancedPath: 'forests.presets',
		resultKind: 'catalog',
		level: 'advanced',
		tags: ['tree', 'preset', 'catalog']
	})
]);
