// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TerrainGeometry.js
 * @description Samples canonical earth and cooperatively finalizes expensive mesh vessels.
 * The Awtsmoos renews cliff, terrace, riverbank, and foundation in bounded moments;
 * Awtsmoos.com preserves exact terrain APIs while the browser remains responsive.
 */

import { v } from '../math/Geometry3D.js';
import { canonicalTerrainHeightAt, canonicalTerrainZoneAt } from './CanonicalTerrainHeight.js';
import {
	finishTerrainGeometry,
	finishTerrainGeometryAsync
} from './TerrainGeometryFinalization.js';

export const DEFAULT_TERRAIN_SIZE = 540;
export const DEFAULT_TERRAIN_STEPS = 128;
export const terrainHeightAt = canonicalTerrainHeightAt;
export const terrainZoneAt = canonicalTerrainZoneAt;

export function createTerrainGeometry(size = DEFAULT_TERRAIN_SIZE, steps = DEFAULT_TERRAIN_STEPS) {
	const startedAt = now();
	const state = createSamplingState(size, steps);
	for (let index = 0; index < state.total; index += 1) sampleVertex(state, index);
	return finishTerrainGeometry(state, {
		milliseconds: now() - startedAt,
		mode: 'synchronous',
		yields: 0
	}, terrainCoordinateAt);
}

export async function createTerrainGeometryAsync(
	size = DEFAULT_TERRAIN_SIZE,
	steps = DEFAULT_TERRAIN_STEPS,
	options = {}
) {
	const startedAt = now();
	const state = createSamplingState(size, steps);
	const yieldEvery = boundedInteger(options.yieldEvery, 64, 16, 512);
	const yieldWork = options.yieldWork || yieldToBrowser;
	let yields = 0;
	for (let index = 0; index < state.total; index += 1) {
		sampleVertex(state, index);
		if ((index + 1) % yieldEvery !== 0 || index + 1 === state.total) continue;
		yields += 1;
		if (yields % 6 === 0) options.onProgress?.(index + 1, state.total);
		await yieldWork();
	}
	options.onProgress?.(state.total, state.total);
	await yieldWork();
	return finishTerrainGeometryAsync(state, {
		milliseconds: 0,
		mode: 'cooperative',
		startedAt,
		yieldEvery,
		yields: yields + 1
	}, terrainCoordinateAt, {
		onPhase: options.onPhase,
		yieldWork
	});
}

export function terrainCoordinateAt(index, steps, half) {
	const normalized = index / steps * 2 - 1;
	const absolute = Math.abs(normalized);
	const centerDense = absolute * 0.32 + Math.pow(absolute, 1.72) * 0.68;
	return Math.sign(normalized) * centerDense * half;
}

function createSamplingState(size, steps) {
	return {
		half: size / 2,
		size,
		steps,
		total: (steps + 1) * (steps + 1),
		uvs: [],
		vertices: [],
		zones: []
	};
}

function sampleVertex(state, index) {
	const rowSize = state.steps + 1;
	const xIndex = index % rowSize;
	const zIndex = Math.floor(index / rowSize);
	const x = terrainCoordinateAt(xIndex, state.steps, state.half);
	const z = terrainCoordinateAt(zIndex, state.steps, state.half);
	const height = terrainHeightAt(x, z);
	state.vertices.push(v(x, height, z));
	state.uvs.push(xIndex / state.steps, zIndex / state.steps);
	state.zones.push(terrainZoneAt(x, z, height));
}

function boundedInteger(value, fallback, minimum, maximum) {
	const resolved = Number.isFinite(Number(value)) ? Number(value) : fallback;
	return Math.max(minimum, Math.min(maximum, Math.floor(resolved)));
}

function yieldToBrowser() {
	if (typeof globalThis.scheduler?.yield === 'function') return globalThis.scheduler.yield();
	return new Promise(resolve => setTimeout(resolve, 0));
}

function now() {
	return globalThis.performance?.now?.() ?? Date.now();
}
