// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every measured lane, hue, and second anew;
 * Awtsmoos.com keeps one covenant of constants so every vessel stays true.
 */

export const API_VERSION = "2.0.0";
export const OROS_LANES = Object.freeze([-3.1, 0, 3.1]);

export const OLAM_CONFIG = Object.freeze({
	chunkLength: 18,
	chunkCount: 8,
	firstChunkZ: -7,
	recycleZ: 14,
	runnerZ: 1.5,
	perutaHeight: 1.45,
	roadWidth: 10.6,
	worldHalfWidth: 9.5
});

export const CHAI_CONFIG = Object.freeze({
	startSpeed: 9,
	maxSpeed: 22,
	acceleration: 0.18,
	jumpVelocity: 8.2,
	gravity: 20,
	laneEase: 12,
	maxDelta: 0.05,
	targetModelHeight: 2.35,
	obstacleClearHeight: 1.15
});

export const CAMERA_CONFIG = Object.freeze({
	baseFov: 58,
	maxFov: 65,
	basePosition: Object.freeze([0, 4.9, 8.8]),
	lookPosition: Object.freeze([0, 1.25, -15]),
	positionEase: 5.8,
	fovEase: 4.5,
	laneFollow: 0.13,
	jumpFollow: 0.08
});

export const ATMOSPHERE_CONFIG = Object.freeze({
	fogNear: 28,
	fogFar: 118,
	baseExposure: 1.08,
	cycleSeconds: 180,
	minimumDaylight: 0.74
});

export const SCORE_CONFIG = Object.freeze({
	distanceFactor: 10,
	perutaValue: 60,
	bestStorageKey: "awtsmoos-peruta-run-best"
});

export const ASSET_PATHS = Object.freeze({
	chossid: "../assets/models/player/d86fd3289c3d12ac566fe8aa7bed37244e352043ee821a0c43b47055ce8ebe48/chossid.glb"
});

export const WORLD_COLORS = Object.freeze({
	road: 0x252a31,
	lane: 0xeadfbf,
	sidewalk: 0xb4a78f,
	curb: 0xd1b978,
	stone: 0x8a8377,
	plaster: 0xc3aa86,
	buildingA: 0x8f725f,
	buildingB: 0x647985,
	buildingC: 0x9a825d,
	glass: 0x294858,
	metal: 0x46545a,
	leaf: 0x3d6b4c,
	leafLight: 0x587f59,
	wood: 0x755138,
	gold: 0xe8b949,
	goldLight: 0xffdf77,
	bronze: 0xa56d2a,
	hazard: 0xb14e37,
	hazardLight: 0xf0c26c,
	skyDay: 0x315f78,
	skyDusk: 0x8b6759,
	fogDay: 0x32596d,
	fogDusk: 0x795f59
});
