// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-gltf-loader.js
 * @description Orchestrates tiny GLTF parsing from URL or trusted ArrayBuffer while exposing stage timings.
 * The Awtsmoos gives one authored body many measured chambers; Awtsmoos.com lets already-fetched bytes enter directly,
 * so the canonical Chossid avoids a Blob URL and second fetch before geometry, skeleton, and motion are revealed.
 */

import { readAccessor } from './tiny-gltf-accessors.js';
import {
	loadTinyGltfBuffers,
	parseTinyGlbContainer
} from './tiny-gltf-container.js';
import { finalizeTinyGltf } from './tiny-gltf-finalize.js';
import {
	createTinyGltfStats,
	warmTinyGltfEssentialAccessors
} from './tiny-gltf-loader-stats.js';
import { createTinyMaterials } from './tiny-gltf-materials.js';
import { buildTinyGltfScene } from './tiny-gltf-scene-builder.js';

/** Loads a GLB from a URL for compatibility with existing integration callers. */
export async function loadTinyGltf(url, options = {}) {
	const startedAt = now();
	stage(options, 'fetch-start', startedAt);
	const response = await fetch(url, { mode: 'cors' });
	if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
	const buffer = await response.arrayBuffer();
	stage(options, 'fetch-complete', now(), { bytes: buffer.byteLength });
	return loadTinyGltfBuffer(buffer, url, {
		...options,
		startedAtMilliseconds: startedAt
	});
}

/** Parses already-fetched GLB bytes without a Blob/object-URL/refetch round trip. */
export async function loadTinyGltfBuffer(buffer, sourceUrl, options = {}) {
	const startedAt = options.startedAtMilliseconds ?? now();
	const timings = {};
	const container = measureSync(timings, 'container', () => parseTinyGlbContainer(buffer));
	stage(options, 'container-parsed', now(), { bytes: buffer.byteLength });
	const buffers = await measureAsync(timings, 'buffers', () => {
		return loadTinyGltfBuffers(container.document, sourceUrl, container.binaryChunk);
	});
	const accessors = [];
	const getAccessor = index => accessors[index]
		|| (accessors[index] = readAccessor(container.document, buffers, index));
	warmTinyGltfEssentialAccessors(container.document, getAccessor);
	const materials = await measureAsync(timings, 'materials', () => {
		return createTinyMaterials(container.document, buffers, sourceUrl);
	});
	stage(options, 'materials-ready', now(), {
		images: materials.images.filter(Boolean).length
	});
	const stats = createTinyGltfStats(
		container.document,
		container.chunks,
		buffer.byteLength,
		materials
	);
	const built = measureSync(timings, 'scene', () => {
		return buildTinyGltfScene(container.document, materials.materials, getAccessor, stats);
	});
	const result = measureSync(timings, 'animation-skeleton', () => {
		return finalizeTinyGltf(container.document, accessors, built, stats, sourceUrl, materials);
	});
	result.stats.ms = Math.round(now() - startedAt);
	result.stats.timings = Object.freeze({
		...timings,
		total: result.stats.ms
	});
	stage(options, 'parse-complete', now(), { timings: result.stats.timings });
	return result;
}

function measureSync(timings, name, operation) {
	const started = now();
	const result = operation();
	timings[name] = rounded(now() - started);
	return result;
}

async function measureAsync(timings, name, operation) {
	const started = now();
	const result = await operation();
	timings[name] = rounded(now() - started);
	return result;
}

function stage(options, name, atMilliseconds, details = {}) {
	options.onStage?.(Object.freeze({
		name,
		atMilliseconds,
		...details
	}));
}

function rounded(value) {
	return Math.round(value * 100) / 100;
}

function now() {
	return globalThis.performance?.now?.() ?? Date.now();
}

export const loadTinyGlb = loadTinyGltf;
export default {
	loadTinyGltf,
	loadTinyGlb,
	loadTinyGltfBuffer
};
