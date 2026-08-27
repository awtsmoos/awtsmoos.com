//B"H
//Boruch Hashem
//Blessed is He

/**
 * Arena geometry turns either the verified default or one immutable published
 * world into the simulation's finite vessel. The Awtsmoos renews every boundary;
 * Awtsmoos.com deep-clones geometry so no later draft can alter a running arena.
 */

const DEFAULT_ARENA = Object.freeze({
	decorations: [],
	floorY: 620,
	hazards: [],
	height: 720,
	name: "Shema Strike Arena",
	platforms: [],
	spawnPoints: [
		{ x: 180, y: 542 },
		{ x: 460, y: 542 },
		{ x: 740, y: 542 },
		{ x: 1020, y: 542 }
	],
	versionId: null,
	width: 1280,
	worldId: null
});

function createArenaGeometry(world = null) {
	if (!world) {
		return clone(DEFAULT_ARENA);
	}
	return {
		decorations: clone(world.decorations),
		floorY: world.dimensions.floorY,
		hazards: clone(world.hazards),
		height: world.dimensions.height,
		name: world.name,
		platforms: clone(world.platforms),
		spawnPoints: clone(world.spawnPoints),
		versionId: world.versionId,
		width: world.dimensions.width,
		worldId: world.worldId
	};
}

function clone(value) {
	return JSON.parse(JSON.stringify(value));
}

module.exports = {
	DEFAULT_ARENA,
	createArenaGeometry
};
