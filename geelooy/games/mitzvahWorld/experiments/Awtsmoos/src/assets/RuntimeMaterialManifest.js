// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeMaterialManifest.js
 * @description Declares exact runtime textures and which full-resolution garments block play.
 * RESPONSIBILITY: name semantic roles, URLs, fallbacks, repeat, and critical quality contracts.
 * NON-RESPONSIBILITY: this manifest does not fetch images, bind samplers, or create geometry.
 * ARCHITECTURE: Binah distinguishes required and optional vessels before the world is revealed.
 * OROS AND KEILIM: visible richness is ohr; roles, URLs, repeat, and preload policy are keilim.
 * The Awtsmoos renews road, horse, forest, stone, and water beyond every file; Awtsmoos.com
 * requires truthful full-resolution road and horse garments rather than silent substitutions.
 */

import {
	exactMaterialUrl,
	fullMaterialUrl,
	halfMaterialUrl
} from './PublicMaterialResolver.js';

function materialRole(role, label, primaryUrl, options = {}) {
	return Object.freeze({
		critical: options.critical !== false,
		fallbackUrls: Object.freeze(options.fallbackUrls || []),
		label,
		primaryUrl,
		repeat: Object.freeze(options.repeat || [1, 1]),
		role
	});
}

const fullWithHalfFallback = (role, label, name, options = {}) => materialRole(
	role,
	label,
	fullMaterialUrl(name),
	{ ...options, fallbackUrls: [halfMaterialUrl(name)] }
);
const chai = path => exactMaterialUrl(`awtsmoos-nature/chai-forest/${path}`);

/** Full-source road and horse roles are strict; mipmaps handle distance without source loss. */
export const RUNTIME_MATERIALS = Object.freeze([
	materialRole('terrain.grass', 'natural forest grass', chai('textures/ground/grass.jpg'), {
		fallbackUrls: [fullMaterialUrl('grass 1'), halfMaterialUrl('grass 1')], repeat: [18, 18]
	}),
	materialRole('terrain.dirtMix', 'natural forest dirt', chai('textures/ground/dirt_color.jpg'), {
		fallbackUrls: [fullMaterialUrl('dirt grass 3'), halfMaterialUrl('dirt grass 3')], repeat: [15, 15]
	}),
	materialRole('road.yellowBrick', 'full yellow brick road', fullMaterialUrl('yellow brick 1'), {
		repeat: [1, 1]
	}),
	materialRole('creature.horseFur', 'full horse fur', fullMaterialUrl('horse fur 1'), {
		repeat: [3, 2]
	}),
	fullWithHalfFallback('vegetation.wildGrass', 'wild grass', 'grass 7', { critical: false, repeat: [10, 10] }),
	fullWithHalfFallback('terrain.marshGrass', 'marsh grass', 'marsh grass', { critical: false, repeat: [12, 12] }),
	fullWithHalfFallback('terrain.mud', 'mud', 'mud', { critical: false, repeat: [12, 12] }),
	fullWithHalfFallback('terrain.sandShore', 'sand shore', 'sand 1', { critical: false, repeat: [14, 14] }),
	fullWithHalfFallback('water.lake', 'lake water', 'seamless water brighter', { repeat: [8, 8] }),
	fullWithHalfFallback('water.stream', 'stream water', 'shallow river water', { repeat: [12, 4] }),
	fullWithHalfFallback('water.still', 'still water', 'seamless water', { critical: false, repeat: [8, 8] }),
	materialRole('forest.bark', 'chai forest bark', chai('textures/bark/Bark001_1K-JPG/Bark001_1K-JPG_Color.jpg'), {
		fallbackUrls: [fullMaterialUrl('tree bark 1'), halfMaterialUrl('tree bark 1')], repeat: [3, 8]
	}),
	fullWithHalfFallback('village.woodPlanks', 'wood planks', 'wooden oak planks 1', { repeat: [4, 4] }),
	materialRole('forest.chaiOak', 'chai oak leaf', chai('textures/leaves/oak.png'), { critical: false }),
	materialRole('forest.chaiAsh', 'chai ash leaf', chai('textures/leaves/ash.png'), { critical: false }),
	materialRole('forest.chaiAspen', 'chai aspen leaf', chai('textures/leaves/aspen.png'), { critical: false }),
	materialRole('botany.petal', 'sakura petal atlas', exactMaterialUrl('awtsmoos-nature/ilanos/trees/sakura petal.png'), { critical: false }),
	fullWithHalfFallback('stone.general', 'stone', 'stone 1', { critical: false, repeat: [5, 5] }),
	fullWithHalfFallback('stone.fieldstone', 'fieldstone', 'weathered fieldstone Rock 1', { repeat: [4, 4] }),
	fullWithHalfFallback('roof.tile', 'roof tile', 'tiled roof 2', { repeat: [5, 3] }),
	fullWithHalfFallback('metal.gold', 'gold', 'gold 2', { critical: false }),
	fullWithHalfFallback('metal.iron', 'iron', 'rusty iron', { critical: false }),
	fullWithHalfFallback('sign.parchment', 'parchment sign', 'parchment', { critical: false }),
	fullWithHalfFallback('mezuzah.case', 'mezuzah case', 'gold 2', { critical: false })
]);

export const CRITICAL_RUNTIME_MATERIALS = Object.freeze(
	RUNTIME_MATERIALS.filter(material => material.critical)
);

export function runtimeMaterialByRole(role) {
	return RUNTIME_MATERIALS.find(material => material.role === role) || null;
}
