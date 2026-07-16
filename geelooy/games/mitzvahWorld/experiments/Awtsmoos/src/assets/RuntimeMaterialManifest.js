// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeMaterialManifest.js
 * @description Declares canonical production textures and their bounded recovery chains.
 * RESPONSIBILITY: name semantic roles, truthful URLs, full-source fallbacks, repeat, and boot policy.
 * NON-RESPONSIBILITY: this manifest never fetches images, binds samplers, or rebuilds geometry.
 * The Awtsmoos renews every garment without descending into preview folders; Awtsmoos.com
 * preserves fast first motion through solid materials and hydrates only verified production sources.
 */

import {
	exactMaterialUrl,
	fullMaterialUrl
} from './PublicMaterialResolver.js';
import {
	assertProductionMaterialUrl,
	productionMaterialFallbacks
} from './ProductionMaterialUrlPolicy.js';

function materialRole(role, label, primaryUrl, options = {}) {
	return Object.freeze({
		critical: options.critical !== false,
		fallbackUrls: productionMaterialFallbacks(options.fallbackUrls, role),
		label,
		primaryUrl: assertProductionMaterialUrl(primaryUrl, role),
		repeat: Object.freeze(options.repeat || [1, 1]),
		role
	});
}

function fullRole(role, label, name, options = {}) {
	return materialRole(role, label, fullMaterialUrl(name), options);
}

function sourceRole(role, label, path, options = {}) {
	return materialRole(role, label, exactMaterialUrl(path), options);
}

const CHAI_FOREST = 'awtsmoos-nature/chai-forest';

export const RUNTIME_MATERIALS = Object.freeze([
	sourceRole('terrain.grass', 'canonical Chai Forest grass', `${CHAI_FOREST}/textures/ground/grass.jpg`, {
		fallbackUrls: [fullMaterialUrl('grass 1')],
		repeat: [18, 18]
	}),
	sourceRole('terrain.dirtMix', 'canonical Chai Forest dirt', `${CHAI_FOREST}/textures/ground/dirt_color.jpg`, {
		fallbackUrls: [fullMaterialUrl('dirt grass 3')],
		repeat: [15, 15]
	}),
	fullRole('road.yellowBrick', 'full yellow brick road', 'yellow brick 1'),
	fullRole('creature.horseFur', 'full horse fur', 'horse fur 1', { repeat: [3, 2] }),
	fullRole('vegetation.wildGrass', 'wild grass', 'grass 7', { critical: false, repeat: [10, 10] }),
	fullRole('terrain.marshGrass', 'marsh grass', 'marsh grass', { critical: false, repeat: [12, 12] }),
	fullRole('terrain.mud', 'mud', 'mud', { critical: false, repeat: [12, 12] }),
	fullRole('terrain.sandShore', 'sand shore', 'sand 1', { critical: false, repeat: [14, 14] }),
	fullRole('water.lake', 'lake water color', 'seamless water brighter', { repeat: [8, 8] }),
	fullRole('water.stream', 'stream water color', 'shallow river water', { repeat: [12, 4] }),
	fullRole('water.still', 'still water color', 'seamless water', { critical: false, repeat: [8, 8] }),
	sourceRole('forest.bark', 'canonical Chai Forest bark', `${CHAI_FOREST}/textures/bark/Bark001_1K-JPG/Bark001_1K-JPG_Color.jpg`, {
		fallbackUrls: [fullMaterialUrl('tree bark 1')],
		repeat: [3, 8]
	}),
	fullRole('village.woodPlanks', 'wood planks', 'wooden oak planks 1', { repeat: [4, 4] }),
	sourceRole('forest.chaiOak', 'canonical Chai oak leaf', `${CHAI_FOREST}/textures/leaves/oak.png`, { critical: false }),
	sourceRole('forest.chaiAsh', 'canonical Chai ash leaf', `${CHAI_FOREST}/textures/leaves/ash.png`, { critical: false }),
	sourceRole('forest.chaiAspen', 'canonical Chai aspen leaf', `${CHAI_FOREST}/textures/leaves/aspen.png`, { critical: false }),
	sourceRole('forest.chaiPine', 'canonical Chai pine leaf', `${CHAI_FOREST}/textures/leaves/pine.png`, { critical: false }),
	sourceRole('botany.petal', 'sakura petal atlas', 'awtsmoos-nature/ilanos/trees/sakura petal.png', { critical: false }),
	fullRole('stone.general', 'stone', 'stone 1', { critical: false, repeat: [5, 5] }),
	fullRole('stone.fieldstone', 'fieldstone', 'weathered fieldstone Rock 1', { repeat: [4, 4] }),
	fullRole('roof.tile', 'roof tile', 'tiled roof 2', { repeat: [5, 3] }),
	fullRole('metal.gold', 'gold', 'gold 2', { critical: false }),
	fullRole('metal.iron', 'iron', 'rusty iron', { critical: false }),
	fullRole('sign.parchment', 'parchment sign', 'parchment', { critical: false }),
	fullRole('mezuzah.case', 'mezuzah case', 'gold 2', { critical: false })
]);

export const CRITICAL_RUNTIME_MATERIALS = Object.freeze(
	RUNTIME_MATERIALS.filter((material) => {
		return material.critical;
	})
);

export function runtimeMaterialByRole(role) {
	return RUNTIME_MATERIALS.find((material) => {
		return material.role === role;
	}) || null;
}
