// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeMaterialManifest.js
 * @description Declares exact runtime textures and which garments block play.
 * RESPONSIBILITY: name semantic roles, real URLs, fallbacks, repeat, and quality contracts.
 * NON-RESPONSIBILITY: this manifest does not fetch images, bind samplers, or create geometry.
 * ARCHITECTURE: Binah distinguishes required and optional vessels before the world is revealed.
 * OROS AND KEILIM: visible richness is ohr; roles, URLs, repeat, and preload policy are keilim.
 * The Awtsmoos renews road, horse, forest, stone, and water beyond every file; Awtsmoos.com
 * uses the licensed 512-POT Chai Forest pack where source-sized photographs would waste frames.
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

const fullOnly = (role, label, name, options = {}) => materialRole(
	role,
	label,
	fullMaterialUrl(name),
	options
);

const chai512 = path => exactMaterialUrl(`awtsmoos-nature/chai-forest-half/${path}`);

/** Full-source road and horse roles are strict; mipmaps handle distance without source loss. */
export const RUNTIME_MATERIALS = Object.freeze([
	materialRole('terrain.grass', 'licensed 512 Chai Forest grass', chai512('textures/ground/grass.jpg'), {
		fallbackUrls: [fullMaterialUrl('grass 1'), halfMaterialUrl('grass 1')], repeat: [18, 18]
	}),
	materialRole('terrain.dirtMix', 'licensed 512 Chai Forest dirt', chai512('textures/ground/dirt_color.jpg'), {
		fallbackUrls: [fullMaterialUrl('dirt grass 3'), halfMaterialUrl('dirt grass 3')], repeat: [15, 15]
	}),
	materialRole('road.yellowBrick', 'full yellow brick road', fullMaterialUrl('yellow brick 1'), {
		repeat: [1, 1]
	}),
	materialRole('creature.horseFur', 'full horse fur', fullMaterialUrl('horse fur 1'), {
		repeat: [3, 2]
	}),
	fullWithHalfFallback('vegetation.wildGrass', 'wild grass', 'grass 7', { critical: false, repeat: [10, 10] }),
	fullOnly('terrain.marshGrass', 'marsh grass', 'marsh grass', { critical: false, repeat: [12, 12] }),
	fullOnly('terrain.mud', 'mud', 'mud', { critical: false, repeat: [12, 12] }),
	fullWithHalfFallback('terrain.sandShore', 'sand shore', 'sand 1', { critical: false, repeat: [14, 14] }),
	fullOnly('water.lake', 'lake water color', 'seamless water brighter', { repeat: [8, 8] }),
	fullOnly('water.stream', 'stream water color', 'shallow river water', { repeat: [12, 4] }),
	fullOnly('water.still', 'still water color', 'seamless water', { critical: false, repeat: [8, 8] }),
	materialRole('forest.bark', 'licensed POT Chai Forest bark', chai512('textures/bark/Bark001_1K-JPG/Bark001_1K-JPG_Color.jpg'), {
		fallbackUrls: [fullMaterialUrl('tree bark 1'), halfMaterialUrl('tree bark 1')], repeat: [3, 8]
	}),
	fullWithHalfFallback('village.woodPlanks', 'wood planks', 'wooden oak planks 1', { repeat: [4, 4] }),
	materialRole('forest.chaiOak', 'licensed 512 Chai oak leaf', chai512('textures/leaves/oak.png'), { critical: false }),
	materialRole('forest.chaiAsh', 'licensed 512 Chai ash leaf', chai512('textures/leaves/ash.png'), { critical: false }),
	materialRole('forest.chaiAspen', 'licensed 512 Chai aspen leaf', chai512('textures/leaves/aspen.png'), { critical: false }),
	materialRole('forest.chaiPine', 'licensed 512 Chai pine leaf', chai512('textures/leaves/pine.png'), { critical: false }),
	materialRole('botany.petal', 'sakura petal atlas', exactMaterialUrl('awtsmoos-nature/ilanos/trees/sakura petal.png'), { critical: false }),
	fullWithHalfFallback('stone.general', 'stone', 'stone 1', { critical: false, repeat: [5, 5] }),
	fullWithHalfFallback('stone.fieldstone', 'fieldstone', 'weathered fieldstone Rock 1', { repeat: [4, 4] }),
	fullWithHalfFallback('roof.tile', 'roof tile', 'tiled roof 2', { repeat: [5, 3] }),
	fullWithHalfFallback('metal.gold', 'gold', 'gold 2', { critical: false }),
	fullOnly('metal.iron', 'iron', 'rusty iron', { critical: false }),
	fullOnly('sign.parchment', 'parchment sign', 'parchment', { critical: false }),
	fullWithHalfFallback('mezuzah.case', 'mezuzah case', 'gold 2', { critical: false })
]);

export const CRITICAL_RUNTIME_MATERIALS = Object.freeze(
	RUNTIME_MATERIALS.filter(material => material.critical)
);

export function runtimeMaterialByRole(role) {
	return RUNTIME_MATERIALS.find(material => material.role === role) || null;
}
