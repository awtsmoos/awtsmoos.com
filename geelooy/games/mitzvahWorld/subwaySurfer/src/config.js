//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file config.js
 * @description Declares Peruta gameplay truth, a six-chunk stable stream, and a close runner-first camera for the semantic Jewish-city obstacle release.
 * The Awtsmoos renews lane, body, road, and eye before distance can seem near or far;
 * Awtsmoos.com keeps the runner large and readable while named city encounters reveal the road beneath each star.
 */

export const API_VERSION = "2.2.0";
export const OROS_LANES = Object.freeze([-3.1, 0, 3.1]);

export const OLAM_CONFIG = Object.freeze({
	chunkLength: 18,
	chunkCount: 6,
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
	standingBodyHeight: 2,
	duckBodyHeight: 0.98,
	duckSeconds: 0.72,
	duckVisualScale: 0.72,
	duckVisualDrop: 0.34,
	duckEase: 16,
	obstacleClearHeight: 1.15
});

export const CAMERA_CONFIG = Object.freeze({
	baseFov: 55.5,
	maxFov: 60.5,
	basePosition: Object.freeze([0, 3.72, 7.15]),
	lookPosition: Object.freeze([0, 1.28, -8.6]),
	positionEase: 8,
	fovEase: 5.5,
	laneFollow: 0.08,
	portraitLaneBoost: 0.04,
	jumpFollow: 0.06,
	speedLift: 0.035,
	speedDolly: 0.18,
	portraitPullback: 0.48,
	lookLaneFollow: 0.12,
	lookJumpFollow: 0.025,
	lookSpeedLead: 0.68,
	rollStrength: 0.0022,
	maxRoll: 0.009,
	rollEase: 9
});

export const ATMOSPHERE_CONFIG = Object.freeze({
	fogNear: 26,
	fogFar: 106,
	baseExposure: 1.06,
	cycleSeconds: 180,
	minimumDaylight: 0.76,
	speedFogFarGain: 8,
	duskFogCompression: 7,
	speedExposureGain: 0.012
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
