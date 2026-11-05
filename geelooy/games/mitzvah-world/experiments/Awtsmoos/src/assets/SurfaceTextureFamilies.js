// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SurfaceTextureFamilies.js
 * @description Names the large village surfaces that receive stone, earth,
 * timber, water, and roofs as finite garments for the renewing Awtsmoos.
 */
import { fullMaterialUrl } from './PublicMaterialResolver.js';

const freeze = (value) => Object.freeze(value);

export const SURFACE_TEXTURE_FAMILIES = Object.freeze({
	bricks: freeze({
		white1: fullMaterialUrl('white brick 1'),
		red1: fullMaterialUrl('red brick 1'),
		red2: fullMaterialUrl('red brick 2'),
		red3: fullMaterialUrl('red brick 3'),
		yellow1: fullMaterialUrl('yellow brick 1'),
		weatheredRed: fullMaterialUrl('weathered Red bricks 1'),
		limestone1: fullMaterialUrl('limestone bricks 1'),
		fieldstone1: fullMaterialUrl('weathered fieldstone Rock 1')
	}),
	terrain: freeze({
		dirt1: fullMaterialUrl('dirt 1'),
		dirt2: fullMaterialUrl('dirt 2'),
		dirt5: fullMaterialUrl('dirt 5'),
		dirt6: fullMaterialUrl('dirt 6'),
		dirtGrass1: fullMaterialUrl('dirt grass 1'),
		dirtGrass2: fullMaterialUrl('dirt grass 2'),
		dirtGrass3: fullMaterialUrl('dirt grass 3'),
		darkForestFloor: fullMaterialUrl('dark forest floor nonlight'),
		forestLeaves: fullMaterialUrl('forest floor covered with leaves'),
		marshGrass: fullMaterialUrl('marsh grass'),
		mud: fullMaterialUrl('mud'),
		sand1: fullMaterialUrl('sand 1'),
		tilledSoil: fullMaterialUrl('tilled soil'),
		grass1: fullMaterialUrl('grass 1'),
		grass4: fullMaterialUrl('grass 4'),
		grass5: fullMaterialUrl('grass 5'),
		grass6: fullMaterialUrl('grass 6'),
		grass7: fullMaterialUrl('grass 7'),
		grass8: fullMaterialUrl('grass 8')
	}),
	wood: freeze({
		bark1: fullMaterialUrl('tree bark 1'),
		oak1: fullMaterialUrl('oak wood 1'),
		oak2: fullMaterialUrl('oak wood 2'),
		oak3: fullMaterialUrl('oak wood 3'),
		planks1: fullMaterialUrl('wooden oak planks 1'),
		plankedFloor: fullMaterialUrl('wooden planked floor')
	}),
	water: freeze({
		still: fullMaterialUrl('seamless water'),
		bright: fullMaterialUrl('seamless water brighter'),
		shallowRiver: fullMaterialUrl('shallow river water'),
		raw: fullMaterialUrl('water not seamless')
	}),
	stone: freeze({
		stone1: fullMaterialUrl('stone 1'),
		bluestone1: fullMaterialUrl('bluestone 1'),
		cobblestone: fullMaterialUrl('cobblestone'),
		floor1: fullMaterialUrl('stone floor'),
		floor2: fullMaterialUrl('stone floor 2'),
		granite1: fullMaterialUrl('polished granite Rock 1')
	}),
	roof: freeze({
		tile1: fullMaterialUrl('tiled roof 1'),
		tile2: fullMaterialUrl('tiled roof 2'),
		tile3: fullMaterialUrl('tiled roof 3 smaller tiles'),
		tile4: fullMaterialUrl('tiled roof 4')
	})
});
