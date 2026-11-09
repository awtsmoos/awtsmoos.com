// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GrassBladeField.js
 * @description Bounded instanced blade clusters near the camera only
 * (Chapter 4 Task 4), built on the existing BeautyGround pooled tuft buffer
 * — no second tuft system is invented.
 *
 * Gating (Task 1 has NOT passed yet, so blades ship DISABLED): blades are
 * enabled only when the caller passes an explicit `bladesEnabled: true` flag
 * AND the world-experience profile carries `bladeGrass: true`. Survival
 * quality and low quality never get blades — low mode stays attractive on
 * the texture-only ground material alone. Without the explicit flag the
 * field builds nothing and creates no material.
 *
 * Bounds: only BeautyGround grass tufts (never flowers or clover), only
 * within BLADE_FADE_METERS of the camera, nearest first, capped per tier.
 * Blades fade into the matching terrain detail in-shader through the shared
 * grass material's bladeFade band (near 12m, far 25m); no blade is ever
 * placed past the far fade distance, so there is no abrupt cutoff.
 *
 * Cost: placement runs only when the caller rebuilds the tuft ring
 * (BeautyGround `needsTuftRebuild`), never per frame and never per blade.
 * Blade shadows are off (the shared material's policy carries
 * castShadow/receiveShadow false) and sway comes from ONE shared wind
 * uniform — see `grassWindFromMeadowState`.
 *
 * Wind (Task 3 shared state): blade sway is driven from THE shared wind
 * state (`MitzvahWorldWindState`: seed + windPhase in cycles) and/or a
 * `MeadowChunkSimulation` chunk record (same two fields, same phase law) and
 * the shared wind field snapshot (`SharedWindField.snapshot()`:
 * directionX/directionZ/gust/flutter/strength). Either may be absent: with
 * no wind state at all the reader returns strength 0 — no sway, never a
 * crash, never per-blade CPU work. The reader's return value is written
 * onto the one shared wind uniform once per frame at most. Note: Task 3
 * also exports a per-position `mitzvahWorldWindSwayAt` for CPU-side
 * consumers; grass deliberately does NOT use it — the shader derives
 * per-cluster phase from world position, so sway stays at zero per-blade
 * CPU cost.
 */

import { eretzWorldFeatureEnabled } from '../app/EretzWorldFeaturePolicy.js';
import {
	BLADE_FADE_METERS,
	BLADE_NEAR_METERS,
	GRASS_MATERIAL_ID,
	GRASS_WIND_STRENGTH,
	createSharedGrassMaterial,
	createSharedGrassWind,
	generateGrassBladeAlpha,
	planGrassClusters
} from '../app/MitzvahWorldGrassMaterial.js';
import { isSurvivalQuality } from '../performance/SurvivalQualityPolicy.js';
import { normalizeWindState } from '../world/streaming/MitzvahWorldWindState.js';
import {
	TUFT_GRASS,
	TUFT_STRIDE
} from './BeautyGround.js';

/** Per-tier blade instance caps — always below the BeautyGround tuft budget for the tier. */
export const BLADE_INSTANCE_CAPS = Object.freeze({
	cinematic: 360,
	high: 260,
	low: 0,
	medium: 160
});

/** Blades never exist past this distance from the camera (the shared material's far fade). */
export const BLADE_MAX_DISTANCE_METERS = BLADE_FADE_METERS;
/** Fade band start, carried from the shared grass material. */
export const BLADE_FADE_NEAR_METERS = BLADE_NEAR_METERS;
/** Default sway direction (unit-ish) when no wind state supplies one. */
export const GRASS_WIND_DEFAULT_DIRECTION = Object.freeze({ x: 0.8, z: 0.6 });

/** Resolves a quality tier to its blade instance cap (low is always 0). */
export function bladeInstanceCap(quality = 'high') {
	return BLADE_INSTANCE_CAPS[quality] ?? BLADE_INSTANCE_CAPS.high;
}

/**
 * The blade gate. Blades are OFF unless every condition holds:
 * - an explicit `bladesEnabled: true` flag (Task 1 gate — do not enable unconditionally);
 * - the world-experience profile enables `bladeGrass`;
 * - quality is not survival and not low.
 * Survival overrides everything: `bladeGrass` is a survival-disabled feature.
 */
export function bladesEnabledFor(options = {}) {
	if (isSurvivalQuality(options)) return false;
	const quality = options?.quality || options?.qualityProfile?.quality || 'high';
	if (quality === 'low') return false;
	if (options?.bladesEnabled !== true) return false;
	return eretzWorldFeatureEnabled(options, 'bladeGrass', false);
}

// One shared blade material per runtime — the same singleton the blade
// material module defines, cached here so repeated chunk reloads never
// create a second material or a second blade texture.
let sharedBladeMaterial = null;
let sharedBladeMaterialCalls = 0;

/**
 * Returns the one shared blade material, creating it on first use through
 * the injected factory. Returns null when no factory is supplied (the pure
 * geometry path still builds instance matrices without a renderer).
 */
export function grassBladeMaterial(createMaterial) {
	if (sharedBladeMaterial) return sharedBladeMaterial;
	if (typeof createMaterial !== 'function') return null;
	sharedBladeMaterialCalls += 1;
	sharedBladeMaterial = createSharedGrassMaterial({
		createMaterial,
		image: generateGrassBladeAlpha(),
		quality: 'high'
	});
	return sharedBladeMaterial;
}

/** How many times the shared blade material factory has run (0 or 1). */
export function grassBladeMaterialCreateCount() {
	return sharedBladeMaterialCalls;
}

/** Clears the shared blade material cache (tests / quality-tier switches). */
export function resetGrassBladeMaterial() {
	sharedBladeMaterial = null;
	sharedBladeMaterialCalls = 0;
}

/**
 * Builds one bounded instanced blade field from a BeautyGround tuft result.
 * Pure function of the tuft buffer + camera: deterministic, no allocation
 * beyond the returned matrices, no per-blade CPU work at render time.
 *
 * @param {object} input {buffer, count} from placeNearTufts, camera, quality, options.
 * @returns Frozen field: {enabled, matrices, count, maxDistance, clusters, material, materialId}.
 */
export function buildGrassBladeField({
	buffer,
	cameraX = 0,
	cameraZ = 0,
	count = 0,
	createMaterial = null,
	quality = 'high',
	options = {}
} = {}) {
	const enabled = bladesEnabledFor({ ...options, quality });
	if (!enabled) {
		return Object.freeze({
			clusters: Object.freeze([]),
			count: 0,
			enabled: false,
			material: null,
			materialId: GRASS_MATERIAL_ID,
			matrices: new Float32Array(0),
			maxDistance: 0,
			quality
		});
	}
	const cap = bladeInstanceCap(quality);
	const kept = [];
	if (buffer && count > 0) {
		for (let i = 0; i < count; i += 1) {
			const offset = i * TUFT_STRIDE;
			if (buffer[offset + 4] !== TUFT_GRASS) continue;
			const x = buffer[offset];
			const z = buffer[offset + 2];
			const dx = x - cameraX;
			const dz = z - cameraZ;
			const distance = Math.sqrt(dx * dx + dz * dz);
			if (distance > BLADE_MAX_DISTANCE_METERS) continue;
			kept.push({ distance, index: i, x, y: buffer[offset + 1], z, scale: buffer[offset + 3], yaw: buffer[offset + 5] });
		}
	}
	// Nearest first: when the cap binds, the farthest blades are the ones dropped.
	kept.sort((a, b) => a.distance - b.distance);
	const chosen = kept.slice(0, cap);
	const matrices = new Float32Array(chosen.length * 16);
	chosen.forEach((tuft, slot) => {
		writeInstanceMatrix(matrices, slot * 16, tuft);
	});
	const clusters = planGrassClusters(chosen.map(tuft => ({
		position: { x: tuft.x, y: tuft.y, z: tuft.z }
	})));
	const maxDistance = chosen.length ? chosen[chosen.length - 1].distance : 0;
	return Object.freeze({
		clusters,
		count: chosen.length,
		enabled: true,
		material: grassBladeMaterial(createMaterial),
		materialId: GRASS_MATERIAL_ID,
		matrices,
		maxDistance,
		quality
	});
}

/**
 * Reads the Task 3 shared wind state into the values the one shared grass
 * wind uniform needs. The first argument is THE shared wind state
 * (`MitzvahWorldWindState`: {seed, windPhase}, windPhase in cycles 0..1)
 * or a `MeadowChunkSimulation` chunk record — the same two fields, the same
 * phase law — and/or a shared wind field snapshot
 * ({directionX, directionZ, gust, flutter, strength} from
 * `SharedWindField.snapshot()`). Either argument may be null or absent.
 * With no wind state at all the reading is strength 0: no sway, never a
 * crash. The caller writes the result onto the shared uniform once per
 * frame at most; the shader derives per-cluster phase from world position,
 * so there is no per-blade CPU work.
 */
export function grassWindFromMeadowState(meadowState = null, sharedWind = null) {
	const windState = meadowState && typeof meadowState === 'object'
		? normalizeWindState(meadowState)
		: null;
	const phase = windState ? finiteCycle(windState.windPhase) : 0;
	const hasSnapshot = sharedWind && typeof sharedWind === 'object';
	const direction = normalizeDirection(
		hasSnapshot ? sharedWind.directionX : GRASS_WIND_DEFAULT_DIRECTION.x,
		hasSnapshot ? sharedWind.directionZ : GRASS_WIND_DEFAULT_DIRECTION.z
	);
	const gust = hasSnapshot ? finite(sharedWind.gust, 0) : 0;
	const flutter = hasSnapshot ? finite(sharedWind.flutter, 0) : 0;
	const baseStrength = hasSnapshot ? finite(sharedWind.strength, 1) : (windState ? 1 : 0);
	const strength = baseStrength === 0
		? 0
		: GRASS_WIND_STRENGTH * baseStrength * (0.54 + gust * 0.38) + flutter * GRASS_WIND_STRENGTH * 0.08;
	return Object.freeze({
		directionX: direction.x,
		directionZ: direction.z,
		flutter,
		gust,
		phase,
		seed: windState ? windState.seed : null,
		strength
	});
}

/**
 * Writes one wind reading onto the shared grass wind uniform (created by
 * `createSharedGrassWind`). Mutates only that one shared object, once per
 * call; the caller calls this at most once per frame.
 */
export function applyGrassWind(wind, reading, seconds = 0) {
	if (!wind || !wind.uniform) return null;
	const uniform = wind.uniform;
	uniform.time = Number(seconds) || 0;
	uniform.directionX = reading?.directionX ?? GRASS_WIND_DEFAULT_DIRECTION.x;
	uniform.directionZ = reading?.directionZ ?? GRASS_WIND_DEFAULT_DIRECTION.z;
	uniform.strength = reading?.strength ?? 0;
	return uniform;
}

export { createSharedGrassWind };

/**
 * Proves the bounded blade contract: gating, caps, distance, fade, and one
 * shared material. `beautyBudget` is the BeautyGround tuft budget for the tier.
 */
export function packageGrassBladeFieldEvidence({
	beautyBudget = 0,
	cap = 0,
	count = 0,
	cullDistance = 0,
	enabled = false,
	materialCreateCount = 0,
	maxDistance = 0,
	options = {},
	quality = 'high'
} = {}) {
	const checks = {
		bladeCapRespected: count <= cap,
		bladesWithinFade: maxDistance <= BLADE_MAX_DISTANCE_METERS,
		disabledInLow: quality !== 'low' || !enabled,
		disabledInSurvival: !isSurvivalQuality(options) || !enabled,
		disabledWithoutExplicitFlag: !enabled || bladesEnabledFor({ ...options, quality }),
		fadeBandSane: BLADE_FADE_NEAR_METERS < BLADE_MAX_DISTANCE_METERS
			&& (cullDistance <= 0 || BLADE_MAX_DISTANCE_METERS <= cullDistance),
		singleMaterial: materialCreateCount <= 1,
		underTuftBudget: beautyBudget <= 0 || count <= beautyBudget
	};
	return Object.freeze({
		checks: Object.freeze(checks),
		ok: Object.values(checks).every(Boolean)
	});
}

/** Writes T(position) * Ry(yaw) * S(scale) column-major into the matrix array. */
function writeInstanceMatrix(matrices, offset, tuft) {
	const scale = Math.max(0.05, Number(tuft.scale) || 1);
	const cosine = Math.cos(tuft.yaw) * scale;
	const sine = Math.sin(tuft.yaw) * scale;
	matrices[offset] = cosine;
	matrices[offset + 1] = 0;
	matrices[offset + 2] = -sine;
	matrices[offset + 3] = 0;
	matrices[offset + 4] = 0;
	matrices[offset + 5] = scale;
	matrices[offset + 6] = 0;
	matrices[offset + 7] = 0;
	matrices[offset + 8] = sine;
	matrices[offset + 9] = 0;
	matrices[offset + 10] = cosine;
	matrices[offset + 11] = 0;
	matrices[offset + 12] = tuft.x;
	matrices[offset + 13] = tuft.y;
	matrices[offset + 14] = tuft.z;
	matrices[offset + 15] = 1;
}

function finite(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

function finiteCycle(value) {
	const number = Number(value);
	if (!Number.isFinite(number)) return 0;
	return ((number % 1) + 1) % 1;
}

function normalizeDirection(x, z) {
	const dx = finite(x, GRASS_WIND_DEFAULT_DIRECTION.x);
	const dz = finite(z, GRASS_WIND_DEFAULT_DIRECTION.z);
	const length = Math.sqrt(dx * dx + dz * dz) || 1;
	return Object.freeze({ x: dx / length, z: dz / length });
}
