// B"H
import { createDoorWallSet } from './DoorWallSystem.js';
import { createFenceAlongPath } from './ProceduralFenceSystem.js';
import { createInteriorRoomSet } from './InteriorRoomSystem.js';
import { createMezuzaDef } from './MezuzaSystem.js';
import {
	createStoryFloorPieces,
	stairwellOpening
} from './StoryFloorSystem.js';
import {
	materialTexture,
	REPEAT_HOOKS
} from '../assets/TextureRepeat.js';

export const DEFAULT_HOUSE_SPEC = Object.freeze({
	id: 'Awtsmoos-main-house',
	x: 58,
	z: -64,
	yaw: 0,
	width: 60,
	depth: 46,
	wallH: 17,
	wallT: 0.9,
	doorW: 2.7,
	doorH: 3,
	roofRise: 7,
	roofOver: 3.4,
	floors: 2,
	fence: true,
	storyHeight: 7.4
});

export const HOUSE_ROOM_KINDS = Object.freeze([
	'main-house',
	'west-learning-house',
	'east-family-house',
	'north-study-house',
	'south-guest-house'
]);

/**
 * Builds one measured house from independent, readable systems. Doorway walls
 * are true boolean meshes, room partitions span the clear interior width, and
 * every upper floor is complete except for its shared stairwell opening.
 */
export function createModularHouse(
	assets = {},
	specification = DEFAULT_HOUSE_SPEC,
	groundSampler
) {
	const spec = resolveSpec(specification, groundSampler);
	const materials = createMaterials(assets);
	const frontDoor = createFrontDoorSet(assets, spec);
	const rooms = createInteriorRoomSet({
		spec,
		materials,
		localToWorld
	});
	const definitions = [
		createFoundation(spec, materials),
		createGroundFloor(spec, materials),
		createBackWall(spec, materials),
		createLeftWall(spec, materials),
		createRightWall(spec, materials),
		frontDoor.wall,
		createMezuzaDef(frontDoor.spec, materials.mezuza),
		createRoof(spec, materials),
		...createEntryStairs(spec, materials, groundSampler),
		...rooms.staticDefs
	];
	for (let level = 1; level < spec.floors; level += 1) {
		definitions.push(...createStoryFloorPieces({
			spec,
			material: materials.stone,
			level,
			box: createBox
		}));
		definitions.push(...createInteriorStairs(
			spec,
			materials,
			level - 1,
			level
		));
	}
	if (spec.fence && groundSampler) {
		definitions.push(...createFenceAlongPath({
			id: `${spec.id}-measured-fence`,
			segments: createFenceSegments(spec),
			groundSampler,
			material: {
				...materials.fence,
				doubleSided: true
			}
		}));
	}
	definitions.userData = {
		doorDefs: [frontDoor.door, ...rooms.doorDefs],
		roomDebug: rooms.debug
	};
	return definitions;
}

/** Returns every dynamic door belonging to one house. */
export function modularHouseDoorDefs(
	assets = {},
	specification = DEFAULT_HOUSE_SPEC,
	groundSampler
) {
	const spec = resolveSpec(specification, groundSampler);
	const materials = createMaterials(assets);
	const frontDoor = createFrontDoorSet(assets, spec);
	const rooms = createInteriorRoomSet({
		spec,
		materials,
		localToWorld
	});
	return [frontDoor.door, ...rooms.doorDefs];
}

export function modularHouseDoorDef(
	assets = {},
	specification = DEFAULT_HOUSE_SPEC,
	groundSampler
) {
	return modularHouseDoorDefs(
		assets,
		specification,
		groundSampler
	)[0];
}

export function modularHouseDoorWorld(specification = DEFAULT_HOUSE_SPEC) {
	const spec = { ...DEFAULT_HOUSE_SPEC, ...specification };
	return localToWorld(spec, 0, spec.depth / 2 - spec.wallT / 2);
}

export function modularHouseRoadStart(specification = DEFAULT_HOUSE_SPEC) {
	const spec = { ...DEFAULT_HOUSE_SPEC, ...specification };
	const point = localToWorld(spec, 0, spec.depth / 2 + 10);
	return { x: point.x, z: point.z };
}

export function modularHouseAnchors(specification = DEFAULT_HOUSE_SPEC) {
	const spec = { ...DEFAULT_HOUSE_SPEC, ...specification };
	const opening = stairwellOpening(spec, 1);
	return {
		id: spec.id,
		frontDoor: modularHouseRoadStart(spec),
		frontStairs: localToWorld(spec, 0, spec.depth / 2 + 5.5),
		insideFoyer: localToWorld(spec, 0, spec.depth / 2 - 5),
		hallCenter: localToWorld(spec, 0, 0),
		backRoom: localToWorld(spec, 0, -spec.depth / 2 + 7),
		leftRoom: localToWorld(spec, -spec.width / 2 + 8, 0),
		rightRoom: localToWorld(spec, spec.width / 2 - 8, 0),
		upstairsHook: {
			...localToWorld(spec, opening.centerX, opening.centerZ),
			y: (spec.floorY || 0) + spec.storyHeight
		}
	};
}

export function createFutureHouseSpecs(base = DEFAULT_HOUSE_SPEC) {
	const shared = { ...DEFAULT_HOUSE_SPEC, ...base };
	return [
		{
			...shared,
			id: 'Awtsmoos-west-learning-house',
			x: -88,
			z: 62,
			yaw: 0.18,
			width: 46,
			depth: 34,
			wallH: 15,
			floors: 2,
			storyHeight: 6.6
		},
		{
			...shared,
			id: 'Awtsmoos-east-family-house',
			x: 118,
			z: 50,
			yaw: -0.22,
			width: 48,
			depth: 36,
			wallH: 16,
			floors: 2,
			storyHeight: 6.8
		},
		{
			...shared,
			id: 'Awtsmoos-north-study-house',
			x: -94,
			z: -72,
			yaw: -0.12,
			width: 44,
			depth: 32,
			wallH: 14,
			floors: 2,
			storyHeight: 6.3
		},
		{
			...shared,
			id: 'Awtsmoos-south-guest-house',
			x: 160,
			z: -112,
			yaw: 0.16,
			width: 42,
			depth: 31,
			wallH: 13,
			floors: 1,
			storyHeight: 6.2
		}
	];
}

function resolveSpec(specification, sampler) {
	const spec = { ...DEFAULT_HOUSE_SPEC, ...specification };
	if (!sampler) {
		return {
			...spec,
			floorY: spec.floorY ?? 0,
			groundMin: spec.floorY ?? 0
		};
	}
	const samples = [
		[-spec.width / 2, -spec.depth / 2],
		[spec.width / 2, -spec.depth / 2],
		[-spec.width / 2, spec.depth / 2],
		[spec.width / 2, spec.depth / 2]
	].map(([x, z]) => {
		const point = localToWorld(spec, x, z);
		return sampler.heightAt(point.x, point.z);
	});
	return {
		...spec,
		floorY: Math.max(...samples.map((sample) => sample.y)),
		groundMin: Math.min(...samples.map((sample) => sample.y)),
		groundEvidence: samples.map((sample) => sample.source)
	};
}

function createFrontDoorSet(assets, spec) {
	const point = modularHouseDoorWorld(spec);
	const materials = createMaterials(assets);
	return createDoorWallSet({
		id: `${spec.id}-front`,
		wallId: `${spec.id}-front-wall`,
		doorId: `${spec.id}-front-door`,
		x: point.x,
		z: point.z,
		floorY: spec.floorY,
		yaw: spec.yaw,
		wallW: spec.width,
		wallH: spec.wallH,
		wallT: spec.wallT,
		doorW: spec.doorW,
		doorH: spec.doorH,
		doorThickness: 0.24,
		panelGap: 0.08,
		doorDepth: 0,
		openAngle: Math.PI * 0.54,
		noEdge: true
	}, {
		...materials.wall,
		doorMaterial: materials.door
	});
}

function createMaterials(assets) {
	return {
		wall: createMaterial(
			'#eee8d9',
			assets.whiteBrickImage || assets.brickImage,
			REPEAT_HOOKS.wallTileWorld
		),
		side: createMaterial(
			'#eee8d9',
			assets.whiteBrickImage || assets.brickImage,
			REPEAT_HOOKS.wallTileWorld
		),
		stone: createMaterial(
			'#c7bea9',
			assets.stoneImage,
			REPEAT_HOOKS.floorTileWorld
		),
		door: createMaterial('#7d4827', assets.woodImage, 2),
		roof: createMaterial(
			'#8a5b35',
			assets.woodImage,
			REPEAT_HOOKS.roofTileWorld
		),
		fence: createMaterial('#d8c0a0', assets.woodImage, 2),
		mezuza: createMaterial(
			'#b58a28',
			assets.goldImage || assets.woodImage,
			0.5
		)
	};
}

function createMaterial(color, image, tileWorld) {
	return materialTexture(color, image, [1, 1], {
		backfaceCull: true,
		tileWorld,
		projection: 'cube-world',
		hook: 'modular-house'
	});
}

function createFoundation(spec, materials) {
	const depth = Math.max(0.35, spec.floorY - spec.groundMin + 0.2);
	return createBox(
		`${spec.id}-measured-foundation`,
		materials.stone,
		spec,
		0,
		spec.floorY - depth / 2,
		0,
		spec.width,
		depth,
		spec.depth,
		true
	);
}

function createGroundFloor(spec, materials) {
	return createBox(
		`${spec.id}-floor-1`,
		materials.stone,
		spec,
		0,
		spec.floorY + 0.08,
		0,
		spec.width - spec.wallT * 2,
		0.18,
		spec.depth - spec.wallT * 2,
		true
	);
}

function createBackWall(spec, materials) {
	return createBox(
		`${spec.id}-back-wall`,
		materials.wall,
		spec,
		0,
		spec.floorY + spec.wallH / 2,
		-spec.depth / 2 + spec.wallT / 2,
		spec.width,
		spec.wallH,
		spec.wallT
	);
}

function createLeftWall(spec, materials) {
	return createBox(
		`${spec.id}-left-wall`,
		materials.side,
		spec,
		-spec.width / 2 + spec.wallT / 2,
		spec.floorY + spec.wallH / 2,
		0,
		spec.wallT,
		spec.wallH,
		spec.depth - spec.wallT * 2
	);
}

function createRightWall(spec, materials) {
	return createBox(
		`${spec.id}-right-wall`,
		materials.side,
		spec,
		spec.width / 2 - spec.wallT / 2,
		spec.floorY + spec.wallH / 2,
		0,
		spec.wallT,
		spec.wallH,
		spec.depth - spec.wallT * 2
	);
}

function createEntryStairs(spec, materials, sampler) {
	if (!sampler) {
		return [];
	}
	const baseZ = spec.depth / 2 + 5.4;
	const base = sampleLocal(spec, sampler, 0, baseZ);
	const rise = Math.max(0.08, spec.floorY - base.y);
	const count = Math.max(3, Math.min(6, Math.ceil(rise / 0.28)));
	const stepDepth = 0.9;
	const width = spec.doorW + 3.6;
	const definitions = [];
	for (let index = 0; index < count; index += 1) {
		const progress = index / (count - 1);
		const localZ = baseZ - index * stepDepth;
		const ground = sampleLocal(spec, sampler, 0, localZ);
		const top = ground.y + (spec.floorY - ground.y) * progress;
		definitions.push(createBox(
			`${spec.id}-entry-step-${index + 1}`,
			materials.stone,
			spec,
			0,
			top - 0.12,
			localZ,
			width,
			0.24,
			stepDepth,
			true
		));
	}
	definitions.push(createBox(
		`${spec.id}-door-landing`,
		materials.stone,
		spec,
		0,
		spec.floorY + 0.09,
		spec.depth / 2 + 0.25,
		width + 0.8,
		0.18,
		2,
		true
	));
	return definitions;
}

/**
 * Creates a stair run whose final tread and landing occupy the exact shared
 * stairwell opening. The run approaches the opening rather than colliding with
 * a solid slab.
 */
function createInteriorStairs(spec, materials, fromLevel, toLevel) {
	const startY = spec.floorY + fromLevel * spec.storyHeight;
	const endY = spec.floorY + toLevel * spec.storyHeight;
	const opening = stairwellOpening(spec, toLevel);
	const steps = 10;
	const runDepth = Math.max(6.5, spec.storyHeight * 1.15);
	const startZ = opening.centerZ + runDepth;
	const definitions = [];
	for (let index = 0; index < steps; index += 1) {
		const progress = (index + 1) / steps;
		const localZ = startZ + (opening.centerZ - startZ) * progress;
		const topY = startY + (endY - startY) * progress;
		definitions.push(createBox(
			`${spec.id}-inside-${fromLevel + 1}-${toLevel + 1}-${index + 1}`,
			materials.stone,
			spec,
			opening.centerX,
			topY - 0.14,
			localZ,
			Math.min(2.2, opening.width - 0.7),
			0.28,
			Math.max(0.8, runDepth / steps + 0.08),
			true
		));
	}
	definitions.push(createBox(
		`${spec.id}-inside-${toLevel + 1}-landing`,
		materials.stone,
		spec,
		opening.centerX,
		endY + 0.09,
		opening.centerZ,
		opening.width - 0.35,
		0.18,
		opening.depth - 0.35,
		true
	));
	return definitions;
}

function createRoof(spec, materials) {
	const halfWidth = spec.width / 2 + spec.roofOver;
	const halfDepth = spec.depth / 2 + spec.roofOver;
	const baseY = spec.floorY + spec.wallH;
	const peak = [0, baseY + spec.roofRise, 0];
	const a = [-halfWidth, baseY, halfDepth];
	const b = [halfWidth, baseY, halfDepth];
	const c = [halfWidth, baseY, -halfDepth];
	const d = [-halfWidth, baseY, -halfDepth];
	const vertices = [
		a, b, peak,
		b, c, peak,
		c, d, peak,
		d, a, peak
	];
	const uvs = vertices.flatMap((point) => [
		point[0] / REPEAT_HOOKS.roofTileWorld,
		point[2] / REPEAT_HOOKS.roofTileWorld
	]);
	return {
		id: `${spec.id}-hip-roof`,
		shape: 'manual',
		solid: false,
		walkable: false,
		noEdge: true,
		...materials.roof,
		position: { x: spec.x, y: 0, z: spec.z },
		vertices,
		faces: [
			[0, 1, 2],
			[3, 4, 5],
			[6, 7, 8],
			[9, 10, 11]
		],
		uvs,
		rotation: { y: spec.yaw },
		yaw: spec.yaw
	};
}

function createFenceSegments(spec) {
	const padding = 5;
	const halfWidth = spec.width / 2 + padding;
	const halfDepth = spec.depth / 2 + padding;
	const gateWidth = Math.max(5.2, spec.doorW + 3.2);
	const backLeft = localToWorld(spec, -halfWidth, -halfDepth);
	const backRight = localToWorld(spec, halfWidth, -halfDepth);
	const frontRight = localToWorld(spec, halfWidth, halfDepth);
	const frontLeft = localToWorld(spec, -halfWidth, halfDepth);
	const gateLeft = localToWorld(spec, -gateWidth / 2, halfDepth);
	const gateRight = localToWorld(spec, gateWidth / 2, halfDepth);
	return [
		[backLeft, backRight],
		[backRight, frontRight],
		[frontRight, gateRight],
		[gateLeft, frontLeft],
		[frontLeft, backLeft]
	];
}

function sampleLocal(spec, sampler, x, z) {
	const point = localToWorld(spec, x, z);
	const sample = sampler.heightAt(point.x, point.z);
	return { ...point, y: sample.y, sample };
}

function createBox(
	id,
	material,
	spec,
	localX,
	y,
	localZ,
	sizeX,
	sizeY,
	sizeZ,
	walkable = false
) {
	const point = localToWorld(spec, localX, localZ);
	return {
		id,
		shape: 'box',
		solid: true,
		walkable,
		noEdge: true,
		...material,
		position: { x: point.x, y, z: point.z },
		size: { x: sizeX, y: sizeY, z: sizeZ },
		rotation: { y: spec.yaw }
	};
}

function localToWorld(spec, x, z) {
	const cosine = Math.cos(spec.yaw);
	const sine = Math.sin(spec.yaw);
	return {
		x: spec.x + x * cosine - z * sine,
		z: spec.z + x * sine + z * cosine
	};
}
