// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMaterialPresets.js
 * @description Composes boot-critical world purposes with the uploaded tree filename library.
 * The Awtsmoos clothes terrain, house, river, bark, and leaf through one measured catalog;
 * Awtsmoos.com keeps startup hydration on the new source instead of an obsolete external host.
 */

import {
	remoteTreeTextureUrl
} from './RemoteTextureCatalog.js';
import { TEXTURE_URLS } from './TextureFamilies.js';

const freeze = value => Object.freeze(value);
const tree = remoteTreeTextureUrl;

export const WORLD_MATERIAL_PRESETS = Object.freeze({
	terrainMix: freeze([
		TEXTURE_URLS.terrain.grass1,
		TEXTURE_URLS.terrain.grass6,
		TEXTURE_URLS.terrain.dirtGrass3,
		TEXTURE_URLS.terrain.darkForestFloor,
		TEXTURE_URLS.terrain.forestLeaves,
		TEXTURE_URLS.terrain.marshGrass,
		TEXTURE_URLS.terrain.mud
	]),
	forestLeaves: freeze([
		tree('oak leaf.png'),
		tree('ash leaf.png'),
		tree('aspen leaf.png'),
		tree('pine needles.png')
	]),
	forestBark: freeze([
		tree('redwood bark.png'),
		tree('Olive tree bark.png'),
		tree('cypress bark.png'),
		tree('apple tree bark.png')
	]),
	houseWalls: freeze([
		TEXTURE_URLS.bricks.white1,
		TEXTURE_URLS.bricks.weatheredRed,
		TEXTURE_URLS.bricks.limestone1,
		TEXTURE_URLS.bricks.fieldstone1
	]),
	villageProps: freeze([
		TEXTURE_URLS.wood.planks1,
		TEXTURE_URLS.metals.rustyIron,
		TEXTURE_URLS.fabric.parchment,
		TEXTURE_URLS.fabric.rope,
		TEXTURE_URLS.metals.gold2
	]),
	water: freeze([
		TEXTURE_URLS.water.shallowRiver,
		TEXTURE_URLS.water.bright,
		TEXTURE_URLS.water.still
	])
});

export const TEXTURE_PURPOSES = Object.freeze({
	houseWall: TEXTURE_URLS.bricks.white1,
	lavaPlatform: TEXTURE_URLS.bricks.red3,
	lavaPlatformAlt: TEXTURE_URLS.bricks.red2,
	road: TEXTURE_URLS.bricks.yellow1,
	coin: TEXTURE_URLS.metals.gold2,
	terrainMix: TEXTURE_URLS.terrain.dirtGrass3,
	terrainDirtSet: freeze([
		TEXTURE_URLS.terrain.dirt1,
		TEXTURE_URLS.terrain.dirt2,
		TEXTURE_URLS.terrain.dirtGrass1,
		TEXTURE_URLS.terrain.dirtGrass2,
		TEXTURE_URLS.terrain.dirtGrass3,
		TEXTURE_URLS.terrain.darkForestFloor,
		TEXTURE_URLS.terrain.marshGrass
	]),
	houseFloor: TEXTURE_URLS.stone.stone1,
	houseDoor: TEXTURE_URLS.wood.bark1,
	houseRoof: TEXTURE_URLS.roof.tile2,
	forestBark: tree('redwood bark.png'),
	forestLeaf: tree('oak leaf.png'),
	botanicalLeaf: tree('aspen leaf.png'),
	botanicalPetal: tree('sakura petal.png'),
	lake: TEXTURE_URLS.water.shallowRiver,
	mezuzaCase: TEXTURE_URLS.metals.gold2,
	mezuzaScroll: TEXTURE_URLS.fabric.parchment
});
