// B"H
/**
 * @file helpers.js
 * @description
 * Chapter 77: The Ladder Helpers Minted Copper.
 *
 * Temporary converter helpers preserve legacy level shapes while every future
 * perutah is authored as copper, resettable, and lifted above platforms.
 */
const SPIKE_HEIGHT = 1.65;
const TERRAIN_TOP_Y = -3;
const SPIKE_CENTER_Y = TERRAIN_TOP_Y + SPIKE_HEIGHT / 2;
const COPPER_MATERIAL = Object.freeze({ color: 0xd98a45, emissive: 0x5a240b, metalness: 0.88, roughness: 0.22 });
const nivra = (type, data) => ({ type, ...data });

export const block = (name, x, y, z, width, height, depth, color = 0xc6aa62) => ({ name, width, height, depth, color, textureSeed: name, position: { x, y, z }, safeRect: { x, z, width, depth } });
export const platform = (name, x, y, z, width, depth, color = 0xc6aa62) => block(name, x, y, z, width, 1, depth, color);
export const move = (name, x, y, z, width, depth, axis = "x", distance = 4, speed = 1) => nivra("MovingPlatform", { name, width, height: 0.8, depth, axis, distance, speed, position: { x, y, z } });
export const fake = (name, x, y, z, width, depth) => nivra("BetrayalPlatform", { name, width, height: 0.8, depth, position: { x, y, z } });
export const slip = (name, x, y, z, width, depth, axis = "x", slidePower = 6.5) => nivra("SlipperyPlatform", { name, width, height: 0.8, depth, axis, slidePower, position: { x, y, z } });
export const blast = (name, x, y, z, width, depth, axis = "z", direction = 1, blastSpeed = 30) => nivra("FastPusherPlatform", { name, width, height: 0.8, depth, axis, direction, blastSpeed, position: { x, y, z } });
export const push = (name, x, y, z, width, depth, axis = "z", force = 8, cooldownMs = 500) => nivra("PusherPlatform", { name, width, height: 0.8, depth, axis, force, cooldownMs, position: { x, y, z } });
export const vanish = (name, x, y, z, width, depth, vanishMs = 500) => nivra("DisappearingPlatform", { name, width, height: 0.8, depth, vanishMs, position: { x, y, z } });
export const trapdoor = (name, x, y, z, width, depth, delayMs = 600) => nivra("TrapdoorPlatform", { name, width, height: 0.8, depth, delayMs, position: { x, y, z } });
export const mimic = (name, x, y, z, penalty = 5) => nivra("CoinMimicHazard", { name, penalty, radius: 0.9, height: 1.2, position: { x, y, z } });
export const greedy = (name, x, y, z, baitX, baitZ, value = 3) => nivra("GreedyCoin", { name, bait: { x: baitX, z: baitZ }, value, position: { x, y, z } });
export const spikeCoin = (name, x, y, z, spikeX, spikeZ, penalty = 10) => nivra("SpikeCoin", { name, spikePosition: { x: spikeX, z: spikeZ }, penalty, position: { x, y, z } });
export const npc = (name, x, y, z, dialogue = []) => nivra("InteractiveNpc", { name, dialogue, position: { x, y, z } });
export const stairs = (name, x, y, z, width, height, depth) => ({ name, dimensions: { x: width, y: height, z: depth }, position: { x, y, z }, safeRect: { x, z, width: width + 1.5, depth: depth + 1.5 }, golem: { guf: { StairGeometry: [width, height, depth] }, toyr: { MeshLambertMaterial: { color: 0xb16a3c, emissive: 0x2a1200, map: "awtsmoosTex://brick" } } } });
export const sky = (name = "Calm_Desert_Sky") => ({ name, timeOfDay: 10, timeMultiplier: 0, position: { x: 0, y: 0, z: 0 } });
export const coin = (name, x, y, z, value = 1) => ({ name, value, rotationSpeed: 0.018, proximity: 1.15, position: { x, y, z }, golem: { guf: { CylinderGeometry: [0.58, 0.58, 0.13, 40] }, toyr: { MeshStandardMaterial: { ...COPPER_MATERIAL } } } });
export const bonus = (name, x, y, z, globalValue = 3) => ({ ...coin(name, x, y, z, 0), globalValue, rotationSpeed: 0.024 });
export const spike = (name, x, z, penalty = 0) => ({ name, radius: 1.28, height: SPIKE_HEIGHT, hitRadius: 0.78, verticalHitRange: 0.55, groundY: TERRAIN_TOP_Y, penalty, position: { x, y: SPIKE_CENTER_Y, z }, golem: { guf: { ConeGeometry: [1.1, SPIKE_HEIGHT, 4] }, toyr: { MeshStandardMaterial: { color: 0xff2233, emissive: 0xaa1100, roughness: 0.7, metalness: 0.1 } } } });
export const lavaField = ({ name = "one_lava_floor", minX, maxX, minZ, maxZ, groundY = TERRAIN_TOP_Y }) => ({ name, groundY, height: 0.42, pad: 0.15, lava: true, bounds: { minX, maxX, minZ, maxZ }, position: { x: (minX + maxX) / 2, y: groundY + 0.21, z: (minZ + maxZ) / 2 } });
export const spikedBall = (name, x, y, z, axis = "x", amplitude = 3, speed = 1.2) => ({ name, axis, amplitude, speed, radius: 1.15, position: { x, y, z } });
export const movingBlock = (name, x, y, z, axis = "z", amplitude = 2.6, speed = 1.1) => ({ name, axis, amplitude, speed, size: { x: 3, y: 2.2, z: 1.35 }, position: { x, y, z } });
export const door = (name, x, y, z, next = null) => ({ name, label: name, next, destination: next || "next", isSolid: false, interactable: true, proximity: 3.2, requiresAllCoins: true, manualOnly: true, position: { x, y, z } });
export const terrain = (name, textureType = "sand") => ({ name, width: 180, depth: 120, thickness: 3, segments: 4, isSolid: true, textureType, position: { x: 22, y: TERRAIN_TOP_Y, z: 0 } });
export const player = (x = -8, y = 0.425, z = 0) => ({ name: "The Chossid", height: 1.5, radius: 0.45, dynamicSolidRadius: 0.28, speed: 6.9, speedScale: 1.12, jumpHeight: 13.5, visualGroundBiasY: -0.34, rotationSpeed: 5.2, lerpTurnSpeed: 0.42, movementResponsiveness: 24, stopResponsiveness: 34, animationBlendDuration: 0.055, animationActionTimeScale: 1.18, animationSpeedScale: 1.2, runModeScale: 1, walkModeScale: 0.56, chaweeyoosMap: { run: "run", walk: "walk", idle: "stand", jump: "jump", falling: "falling", "right turn": "right turn", "left turn": "left turn" }, interactable: true, path: "https://models-3122d.web.app/chossid.glb?k=2", position: { x, y, z } });
export const resetPit = (name, x, y, z, width, depth) => ({ name, width, height: 0.4, depth, proximity: 6, penalty: 0, color: 0x330000, position: { x, y, z } });
export const safeRectsFrom = solids => solids.map(solid => solid.safeRect).filter(Boolean);
export const spikeFloor = () => [];
export const level = (shaym, requiredPerutos, nextLevel, nivrayim) => ({ shaym, requiredPerutos, nextLevel, globalCoinStorageKey: "awtsmoosMitzvahGlobalCoins", nivrayim });
