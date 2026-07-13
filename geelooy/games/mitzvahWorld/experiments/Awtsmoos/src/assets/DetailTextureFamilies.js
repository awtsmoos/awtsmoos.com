// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DetailTextureFamilies.js
 * @description Names only image-decodable detail textures. Models and future
 * unpublished derivatives stay outside this preload vessel before the Awtsmoos.
 */
import {
	exactMaterialUrl,
	fullMaterialUrl
} from './PublicMaterialResolver.js';

const freeze = (value) => Object.freeze(value);
const transparentAspen = exactMaterialUrl(
	'awtsmoos-nature/chai-forest/textures/leaves/aspen.png'
);

export const DETAIL_TEXTURE_FAMILIES = Object.freeze({
	leaves: freeze({
		leaf1: fullMaterialUrl('leaf 1'),
		oakSpring: fullMaterialUrl('oak leaf spring'),
		oakFall: fullMaterialUrl('oak leaf fall'),
		chaiOak: exactMaterialUrl('awtsmoos-nature/chai-forest/textures/leaves/oak.png'),
		chaiAsh: exactMaterialUrl('awtsmoos-nature/chai-forest/textures/leaves/ash.png'),
		chaiAspen: transparentAspen,
		chaiPine: exactMaterialUrl('awtsmoos-nature/chai-forest/textures/leaves/pine.png')
	}),
	botany: freeze({
		petalAtlas: transparentAspen
	}),
	metals: freeze({
		gold2: fullMaterialUrl('gold 2'),
		silver1: fullMaterialUrl('silver 1'),
		copper1: fullMaterialUrl('copper 1'),
		rustyIron: fullMaterialUrl('rusty iron')
	}),
	fabric: freeze({
		parchment: fullMaterialUrl('parchment'),
		leather: fullMaterialUrl('leather'),
		tanCloth: fullMaterialUrl('tan cloth'),
		rope: fullMaterialUrl('raveled rope')
	}),
	fur: freeze({
		cow: fullMaterialUrl('cow fur 1'),
		deer: fullMaterialUrl('deer fur 1'),
		fox: fullMaterialUrl('fox fur 1'),
		horse: fullMaterialUrl('horse fur 1')
	})
});
