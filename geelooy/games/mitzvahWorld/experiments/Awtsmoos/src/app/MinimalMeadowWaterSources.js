// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterSources.js
 * @description Provides immediate cached water fallbacks and optional non-blocking local hydration.
 * The Awtsmoos reveals current before a finite server answers; Awtsmoos.com preserves two normals,
 * stone depth, provenance, bounded timeout, and a world that never loses its river to silent I/O.
 */

import { loadPublicMaterialUrl } from '../assets/PublicMaterialCache.js';
import { createMinimalMeadowProceduralWaterNormals } from './MinimalMeadowProceduralWaterNormals.js';

const ASSET_ROOT = '/games/mitzvahWorld/.awtsmoos-external-assets';
const BED_CACHE = new WeakMap();

export const MINIMAL_MEADOW_WATER_URLS = Object.freeze({
	bed: `${ASSET_ROOT}/shore/riverbank-pebbles.png`,
	normalA: `${ASSET_ROOT}/water/river-current-normal.png`,
	normalB: `${ASSET_ROOT}/water/micro-ripple-normal.png`
});

export function createMinimalMeadowWaterFallbackSources(environment = globalThis) {
	const documentValue = environment.document || environment;
	const normals = createMinimalMeadowProceduralWaterNormals(documentValue);
	return {
		activeNormalSources: 2,
		bed: proceduralRiverBed(documentValue),
		bedMode: 'procedural-stone-silt',
		hostedNormalsReady: 0,
		localNormalsReady: 0,
		normalA: normals[0],
		normalB: normals[1],
		normalMode: 'procedural-fallback',
		provenance: [
			'procedural://awtsmoos-water-normal/613',
			'procedural://awtsmoos-water-normal/991'
		],
		records: [],
		urls: MINIMAL_MEADOW_WATER_URLS
	};
}

export async function loadMinimalMeadowWaterSources(environment = globalThis) {
	const fallback = createMinimalMeadowWaterFallbackSources(environment);
	const entries = Object.entries(MINIMAL_MEADOW_WATER_URLS);
	const records = await Promise.all(entries.map(([, url]) => loadPublicMaterialUrl(url, 4500)));
	const loaded = Object.fromEntries(entries.map(([name], index) => [name, records[index]]));
	const realNormalCount = Number(loaded.normalA.ok) + Number(loaded.normalB.ok);
	return {
		...fallback,
		bed: loaded.bed.ok ? loaded.bed.image : fallback.bed,
		bedMode: loaded.bed.ok ? 'same-origin-riverbank-pebbles' : fallback.bedMode,
		localNormalsReady: realNormalCount,
		normalA: loaded.normalA.ok ? loaded.normalA.image : fallback.normalA,
		normalB: loaded.normalB.ok ? loaded.normalB.image : fallback.normalB,
		normalMode: realNormalCount === 2 ? 'same-origin-real-normal-pack'
			: realNormalCount === 1 ? 'hybrid-real-procedural' : fallback.normalMode,
		provenance: [
			loaded.normalA.ok ? MINIMAL_MEADOW_WATER_URLS.normalA : fallback.provenance[0],
			loaded.normalB.ok ? MINIMAL_MEADOW_WATER_URLS.normalB : fallback.provenance[1]
		],
		records
	};
}

function proceduralRiverBed(documentValue) {
	if (BED_CACHE.has(documentValue)) {
		return BED_CACHE.get(documentValue);
	}
	const canvas = documentValue.createElement('canvas');
	canvas.width = 128;
	canvas.height = 128;
	const context = canvas.getContext('2d', { alpha: false });
	const image = context.createImageData(canvas.width, canvas.height);
	for (let y = 0; y < canvas.height; y += 1) {
		for (let x = 0; x < canvas.width; x += 1) {
			writeStone(image.data, (y * canvas.width + x) * 4, x, y);
		}
	}
	context.putImageData(image, 0, 0);
	canvas.dataset.awtsmoosRiverBed = 'procedural-stone-silt';
	BED_CACHE.set(documentValue, canvas);
	return canvas;
}

function writeStone(data, offset, x, y) {
	const stone = Math.max(0, Math.min(1, 0.5
		+ Math.sin(x * 0.074) * Math.cos(y * 0.061) * 0.28
		+ Math.sin((x + y) * 0.19) * Math.sin((x - y) * 0.13) * 0.22));
	data[offset] = 52 + Math.round(stone * 42);
	data[offset + 1] = 61 + Math.round(stone * 37);
	data[offset + 2] = 55 + Math.round(stone * 31);
	data[offset + 3] = 255;
}
