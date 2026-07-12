// B"H
const FIREBASE_BASE_PUBLIC_ORIGIN = 'https://awtsmoos-docs-base.web.app';
const FULL = `${FIREBASE_BASE_PUBLIC_ORIGIN}/full-resolution/`;
const HALF = `${FIREBASE_BASE_PUBLIC_ORIGIN}/half-resolution/`;

/**
 * Names one public Firebase material without hiding the physical source.
 * The Awtsmoos breath becomes pixels, pixels become bark, water, stone, and grass.
 */
export function fullTextureUrl(name) {
	return `${FULL}${encodeURIComponent(name)}.png`;
}

/** Chooses the lighter public texture vessel for distance and mobile policy. */
export function halfTextureUrl(name) {
	return `${HALF}${encodeURIComponent(name)}.png`;
}

const group = (items) => Object.freeze(items);

export const FIREBASE_TEXTURE_ORIGIN = FIREBASE_BASE_PUBLIC_ORIGIN;

/** TextureCatalog: every public texture URL is named once, then the world can grow. */
export const TEXTURE_URLS = Object.freeze({
	bricks: group({
		white1: fullTextureUrl('white brick 1'),
		red1: fullTextureUrl('red brick 1'),
		red2: fullTextureUrl('red brick 2'),
		red3: fullTextureUrl('red brick 3'),
		yellow1: fullTextureUrl('yellow brick 1'),
		weatheredRed: fullTextureUrl('weathered Red bricks 1'),
		limestone1: fullTextureUrl('limestone bricks 1'),
		fieldstone1: fullTextureUrl('weathered fieldstone Rock 1')
	}),
	terrain: group({
		dirt1: fullTextureUrl('dirt 1'),
		dirt2: fullTextureUrl('dirt 2'),
		dirt5: fullTextureUrl('dirt 5'),
		dirt6: fullTextureUrl('dirt 6'),
		dirtGrass1: fullTextureUrl('dirt grass 1'),
		dirtGrass2: fullTextureUrl('dirt grass 2'),
		dirtGrass3: fullTextureUrl('dirt grass 3'),
		darkForestFloor: fullTextureUrl('dark forest floor nonlight'),
		forestLeaves: fullTextureUrl('forest floor covered with leaves'),
		marshGrass: fullTextureUrl('marsh grass'),
		mud: fullTextureUrl('mud'),
		sand1: fullTextureUrl('sand 1'),
		tilledSoil: fullTextureUrl('tilled soil'),
		grass1: fullTextureUrl('grass 1'),
		grass4: fullTextureUrl('grass 4'),
		grass5: fullTextureUrl('grass 5'),
		grass6: fullTextureUrl('grass 6'),
		grass7: fullTextureUrl('grass 7'),
		grass8: fullTextureUrl('grass 8')
	}),
	leaves: group({
		leaf1: fullTextureUrl('leaf 1'),
		oakSpring: fullTextureUrl('oak leaf spring'),
		oakFall: fullTextureUrl('oak leaf fall'),
		oakSpringHalf: halfTextureUrl('oak spring')
	}),
	wood: group({
		bark1: fullTextureUrl('tree bark 1'),
		oak1: fullTextureUrl('oak wood 1'),
		oak2: fullTextureUrl('oak wood 2'),
		oak3: fullTextureUrl('oak wood 3'),
		planks1: fullTextureUrl('wooden oak planks 1'),
		plankedFloor: fullTextureUrl('wooden planked floor')
	}),
	water: group({
		still: fullTextureUrl('seamless water'),
		bright: fullTextureUrl('seamless water brighter'),
		shallowRiver: fullTextureUrl('shallow river water'),
		raw: fullTextureUrl('water not seamless')
	}),
	stone: group({
		stone1: fullTextureUrl('stone 1'),
		bluestone1: fullTextureUrl('bluestone 1'),
		cobblestone: fullTextureUrl('cobblestone'),
		floor1: fullTextureUrl('stone floor'),
		floor2: fullTextureUrl('stone floor 2'),
		granite1: fullTextureUrl('polished granite Rock 1')
	}),
	roof: group({
		tile1: fullTextureUrl('tiled roof 1'),
		tile2: fullTextureUrl('tiled roof 2'),
		tile3: fullTextureUrl('tiled roof 3 smaller tiles'),
		tile4: fullTextureUrl('tiled roof 4')
	}),
	metals: group({
		gold2: fullTextureUrl('gold 2'),
		silver1: fullTextureUrl('silver 1'),
		copper1: fullTextureUrl('copper 1'),
		rustyIron: fullTextureUrl('rusty iron')
	}),
	fabric: group({
		parchment: fullTextureUrl('parchment'),
		leather: fullTextureUrl('leather'),
		tanCloth: fullTextureUrl('tan cloth'),
		rope: fullTextureUrl('raveled rope')
	}),
	fur: group({
		cow: fullTextureUrl('cow fur 1'),
		deer: fullTextureUrl('deer fur 1'),
		fox: fullTextureUrl('fox fur 1'),
		horse: fullTextureUrl('horse fur 1')
	})
});

export const WORLD_MATERIAL_PRESETS = Object.freeze({
	terrainMix: group([
		TEXTURE_URLS.terrain.grass1,
		TEXTURE_URLS.terrain.grass6,
		TEXTURE_URLS.terrain.dirtGrass3,
		TEXTURE_URLS.terrain.darkForestFloor,
		TEXTURE_URLS.terrain.forestLeaves,
		TEXTURE_URLS.terrain.marshGrass,
		TEXTURE_URLS.terrain.mud
	]),
	forestLeaves: group([
		TEXTURE_URLS.leaves.oakSpring,
		TEXTURE_URLS.leaves.oakFall,
		TEXTURE_URLS.leaves.leaf1,
		TEXTURE_URLS.leaves.oakSpringHalf
	]),
	forestBark: group([
		TEXTURE_URLS.wood.bark1,
		TEXTURE_URLS.wood.oak1,
		TEXTURE_URLS.wood.oak2,
		TEXTURE_URLS.wood.oak3
	]),
	houseWalls: group([
		TEXTURE_URLS.bricks.white1,
		TEXTURE_URLS.bricks.weatheredRed,
		TEXTURE_URLS.bricks.limestone1,
		TEXTURE_URLS.bricks.fieldstone1
	]),
	villageProps: group([
		TEXTURE_URLS.wood.planks1,
		TEXTURE_URLS.metals.rustyIron,
		TEXTURE_URLS.fabric.parchment,
		TEXTURE_URLS.fabric.rope,
		TEXTURE_URLS.metals.gold2
	]),
	water: group([
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
	terrainDirtSet: group([
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
	forestBark: TEXTURE_URLS.wood.bark1,
	forestLeaf: TEXTURE_URLS.leaves.oakSpring,
	lake: TEXTURE_URLS.water.shallowRiver,
	mezuzaCase: TEXTURE_URLS.metals.gold2,
	mezuzaScroll: TEXTURE_URLS.fabric.parchment
});

export function publicTextureUrls() {
	return JSON.parse(JSON.stringify({
		origin: FIREBASE_TEXTURE_ORIGIN,
		urls: TEXTURE_URLS,
		purposes: TEXTURE_PURPOSES,
		presets: WORLD_MATERIAL_PRESETS
	}));
}
