// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BeautyGround.js
 * @description Near-camera ground beauty for MitzvahWorld: deterministic meadow tint
 * variation, LOD'd grass tufts and wildflowers ringing the camera, and path-edging
 * stones. Placement is rebuild-on-move (never per frame), writes into pooled
 * Float32Arrays, and every count is capped by the quality tier — the 2ms world-gen
 * cap is never threatened.
 */

import { beautyClamp, beautyNoise2, createBeautyRng } from './BeautyRng.js';

/** Tuft record stride: [x, y, z, scale, type, phase]. */
export const TUFT_STRIDE = 6;
/** Tuft types. */
export const TUFT_GRASS = 0;
export const TUFT_FLOWER = 1;
export const TUFT_CLOVER = 2;

/** Per-tier near-camera detail budgets. */
export const BEAUTY_GROUND_BUDGETS = Object.freeze({
	low: Object.freeze({ tufts: 120, edgingStones: 60, lodNear: 7, lodFar: 16 }),
	medium: Object.freeze({ tufts: 220, edgingStones: 110, lodNear: 9, lodFar: 20 }),
	high: Object.freeze({ tufts: 340, edgingStones: 170, lodNear: 11, lodFar: 24 }),
	cinematic: Object.freeze({ tufts: 480, edgingStones: 240, lodNear: 13, lodFar: 30 })
});

/** Resolves a quality tier to its ground budget (defaults to high). */
export function beautyGroundBudget(quality = 'high') {
	return BEAUTY_GROUND_BUDGETS[quality] || BEAUTY_GROUND_BUDGETS.high;
}

/** Camera must travel this far (world units) before the tuft ring rebuilds. */
export const TUFT_REBUILD_DISTANCE = 3;

const TINT_SEED = 'mitzvah-meadow-tint';

/**
 * Deterministic meadow tint at a ground point: two noise octaves blend three
 * meadow tones (sunlit grass, deep grass, dry earth) so the ground never reads
 * as one flat color. Returns frozen [r, g, b] in a painterly meadow range.
 */
export function groundTint(x, z) {
	const patch = beautyNoise2(x * 0.055, z * 0.055, TINT_SEED);
	const grain = beautyNoise2(x * 0.6 + 40, z * 0.6 - 17, TINT_SEED);
	const sunlit = [0.42, 0.55, 0.24];
	const deep = [0.24, 0.40, 0.16];
	const earth = [0.45, 0.38, 0.24];
	const earthMask = beautyClamp((patch - 0.62) * 3.2, 0, 1);
	const g = 0.82 + grain * 0.36;
	const r = beautyClamp(sunlit[0] + (deep[0] - sunlit[0]) * patch, 0, 1) * (1 - earthMask)
		+ earth[0] * earthMask;
	const gg = beautyClamp(sunlit[1] + (deep[1] - sunlit[1]) * patch, 0, 1) * (1 - earthMask)
		+ earth[1] * earthMask;
	const b = beautyClamp(sunlit[2] + (deep[2] - sunlit[2]) * patch, 0, 1) * (1 - earthMask)
		+ earth[2] * earthMask;
	return Object.freeze([beautyClamp(r * g, 0, 1), beautyClamp(gg * g, 0, 1), beautyClamp(b * g, 0, 1)]);
}

// Pooled tuft buffers, one per quality tier — rebuilt in place, never reallocated.
const tuftPools = new Map();
// Last rebuild centers per tier, for move-hysteresis.
const tuftCenters = new Map();

function tuftPool(quality) {
	const budget = beautyGroundBudget(quality);
	let pool = tuftPools.get(quality);
	if (!pool) {
		pool = new Float32Array(budget.tufts * TUFT_STRIDE);
		tuftPools.set(quality, pool);
	}
	return pool;
}

/**
 * True when the camera has moved far enough to justify a tuft-ring rebuild.
 * Call this before placeNearTufts; it keeps placement out of the per-frame path.
 */
export function needsTuftRebuild(cameraX, cameraZ, quality = 'high') {
	const center = tuftCenters.get(quality);
	if (!center) return true;
	const dx = cameraX - center[0];
	const dz = cameraZ - center[1];
	return dx * dx + dz * dz > TUFT_REBUILD_DISTANCE * TUFT_REBUILD_DISTANCE;
}

/**
 * Places near-camera tufts into the pooled buffer: a dense inner ring (grass +
 * flowers + clover) and a sparse outer ring (grass only), with density falling off
 * by distance. Deterministic per camera cell so nothing pops while walking.
 *
 * @param {number} cameraX Camera x.
 * @param {number} cameraZ Camera z.
 * @param {number} groundY Function (x, z) => y for tuft bases.
 * @param {string} quality Quality tier.
 * @returns {{buffer: Float32Array, count: number}} Pooled buffer + live tuft count.
 */
export function placeNearTufts(cameraX, cameraZ, groundY, quality = 'high') {
	const budget = beautyGroundBudget(quality);
	const buffer = tuftPool(quality);
	// Snap the rebuild center to the hysteresis grid: deterministic placement.
	const cellX = Math.round(cameraX / TUFT_REBUILD_DISTANCE) * TUFT_REBUILD_DISTANCE;
	const cellZ = Math.round(cameraZ / TUFT_REBUILD_DISTANCE) * TUFT_REBUILD_DISTANCE;
	tuftCenters.set(quality, [cellX, cellZ]);
	const rng = createBeautyRng(`tufts:${cellX.toFixed(1)},${cellZ.toFixed(1)}`);
	const sampleY = typeof groundY === 'function' ? groundY : () => 0;
	let count = 0;
	const maxTufts = budget.tufts;
	const innerCount = Math.floor(maxTufts * 0.62);
	for (let i = 0; i < maxTufts && count < maxTufts; i++) {
		const inner = i < innerCount;
		const ring = inner ? 0 : 1;
		const radius = ring === 0
			? Math.sqrt(rng()) * budget.lodNear
			: budget.lodNear + Math.sqrt(rng()) * (budget.lodFar - budget.lodNear);
		const angle = rng() * Math.PI * 2;
		const x = cellX + Math.cos(angle) * radius;
		const z = cellZ + Math.sin(angle) * radius;
		const y = sampleY(x, z);
		if (!Number.isFinite(y)) continue;
		let type = TUFT_GRASS;
		if (inner) {
			const pick = rng();
			type = pick < 0.72 ? TUFT_GRASS : pick < 0.90 ? TUFT_FLOWER : TUFT_CLOVER;
		}
		const fade = ring === 0 ? 1 : 0.75;
		const offset = count * TUFT_STRIDE;
		buffer[offset] = x;
		buffer[offset + 1] = y;
		buffer[offset + 2] = z;
		buffer[offset + 3] = (0.7 + rng() * 0.7) * fade;
		buffer[offset + 4] = type;
		buffer[offset + 5] = rng() * Math.PI * 2;
		count += 1;
	}
	return { buffer, count };
}

// Pooled edging-stone buffers per tier.
const edgingPools = new Map();

/** Stone record stride: [x, y, z, scale, tint, yaw]. */
export const STONE_STRIDE = 6;

/**
 * Lays edging stones along both sides of a path polyline: deterministic jitter,
 * alternating sizes, per-stone tint. Writes into a pooled buffer.
 *
 * @param {Array} pathPoints Flat [x, z, x, z, ...] polyline, at least 2 points.
 * @param {number} groundY Function (x, z) => y.
 * @param {string} quality Quality tier.
 * @returns {{buffer: Float32Array, count: number}} Pooled buffer + live stone count.
 */
export function placePathEdging(pathPoints, groundY, quality = 'high') {
	const budget = beautyGroundBudget(quality);
	let buffer = edgingPools.get(quality);
	if (!buffer) {
		buffer = new Float32Array(budget.edgingStones * STONE_STRIDE);
		edgingPools.set(quality, buffer);
	}
	const sampleY = typeof groundY === 'function' ? groundY : () => 0;
	const rng = createBeautyRng(`edging:${pathPoints.length}`);
	let count = 0;
	const maxStones = budget.edgingStones;
	const halfWidth = 1.15;
	for (let p = 0; p + 3 < pathPoints.length && count + 2 <= maxStones; p += 2) {
		const x0 = pathPoints[p];
		const z0 = pathPoints[p + 1];
		const x1 = pathPoints[p + 2];
		const z1 = pathPoints[p + 3];
		const dx = x1 - x0;
		const dz = z1 - z0;
		const segLen = Math.sqrt(dx * dx + dz * dz) || 1;
		const nx = -dz / segLen;
		const nz = dx / segLen;
		const steps = Math.max(1, Math.floor(segLen / 1.4));
		for (let s = 0; s <= steps && count + 2 <= maxStones; s++) {
			const t = s / steps;
			const px = x0 + dx * t;
			const pz = z0 + dz * t;
			for (const side of [-1, 1]) {
				const jitter = (rng() - 0.5) * 0.5;
				const x = px + nx * side * (halfWidth + jitter * 0.4);
				const z = pz + nz * side * (halfWidth + jitter * 0.4);
				const y = sampleY(x, z);
				if (!Number.isFinite(y)) continue;
				const offset = count * STONE_STRIDE;
				buffer[offset] = x;
				buffer[offset + 1] = y + 0.02;
				buffer[offset + 2] = z;
				buffer[offset + 3] = 0.16 + rng() * 0.22;
				buffer[offset + 4] = 0.75 + rng() * 0.5;
				buffer[offset + 5] = rng() * Math.PI * 2;
				count += 1;
			}
		}
	}
	return { buffer, count };
}

/** Clears pooled ground state (tests / quality-tier switches). */
export function resetBeautyGround() {
	tuftPools.clear();
	tuftCenters.clear();
	edgingPools.clear();
}
