// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterSources.js
 * @description Loads the organized same-origin water pack with deterministic canvas fallbacks.
 * The Awtsmoos carries broad current, fine ripple, and wet stone through nearby truthful vessels;
 * Awtsmoos.com avoids undefined paths, Firebase CORS, duplicate retries, and invisible failure.
 */

import { loadPublicMaterialUrl } from '../assets/PublicMaterialCache.js';
import { createMinimalMeadowProceduralWaterNormals } from './MinimalMeadowProceduralWaterNormals.js';

const ASSET_ROOT = '/games/mitzvahWorld/.awtsmoos-external-assets';

export const MINIMAL_MEADOW_WATER_URLS = Object.freeze({
	bed: `${ASSET_ROOT}/shore/riverbank-pebbles.png`,
	normalA: `${ASSET_ROOT}/water/river-current-normal.png`,
	normalB: `${ASSET_ROOT}/water/micro-ripple-normal.png`
});

export async function loadMinimalMeadowWaterSources(environment = globalThis) {
	const entries = Object.entries(MINIMAL_MEADOW_WATER_URLS);
	const records = await Promise.all(entries.map(([, url]) => loadPublicMaterialUrl(url, 18000)));
	const loaded = Object.fromEntries(entries.map(([name], index) => [name, records[index]]));
	const generated = createMinimalMeadowProceduralWaterNormals(environment.document);
	const normalA = loaded.normalA.ok ? loaded.normalA.image : generated[0];
	const normalB = loaded.normalB.ok ? loaded.normalB.image : generated[1];
	const bed = loaded.bed.ok ? loaded.bed.image : createProceduralRiverBed(environment.document);
	const realNormalCount = Number(loaded.normalA.ok) + Number(loaded.normalB.ok);
	return {
		activeNormalSources: 2,
		bed,
		bedMode: loaded.bed.ok ? 'same-origin-riverbank-pebbles' : 'procedural-stone-silt',
		hostedNormalsReady: 0,
		localNormalsReady: realNormalCount,
		normalA,
		normalB,
		normalMode: normalMode(realNormalCount),
		provenance: [
			loaded.normalA.ok ? MINIMAL_MEADOW_WATER_URLS.normalA : 'procedural://awtsmoos-water-normal/613',
			loaded.normalB.ok ? MINIMAL_MEADOW_WATER_URLS.normalB : 'procedural://awtsmoos-water-normal/991'
		],
		records,
		urls: MINIMAL_MEADOW_WATER_URLS
	};
}

function normalMode(realNormalCount) {
	if (realNormalCount === 2) return 'same-origin-real-normal-pack';
	if (realNormalCount === 1) return 'hybrid-real-procedural';
	return 'procedural-fallback';
}

function createProceduralRiverBed(documentValue) {
	if (!documentValue?.createElement) throw new Error('Riverbed fallback requires a canvas document.');
	const canvas = documentValue.createElement('canvas');
	canvas.width = 256;
	canvas.height = 256;
	const context = canvas.getContext('2d', { alpha: false });
	const image = context.createImageData(canvas.width, canvas.height);
	for (let y = 0; y < canvas.height; y += 1) {
		for (let x = 0; x < canvas.width; x += 1) {
			writeStone(image.data, (y * canvas.width + x) * 4, x, y);
		}
	}
	context.putImageData(image, 0, 0);
	canvas.dataset.awtsmoosRiverBed = 'procedural-stone-silt';
	return canvas;
}

function writeStone(data, offset, x, y) {
	const broad = Math.sin(x * 0.074) * Math.cos(y * 0.061) * 0.28;
	const pebble = Math.sin((x + y) * 0.19) * Math.sin((x - y) * 0.13) * 0.22;
	const grit = Math.sin(x * 0.73 + y * 0.47) * 0.08;
	const stone = Math.max(0, Math.min(1, 0.5 + broad + pebble + grit));
	data[offset] = 52 + Math.round(stone * 42);
	data[offset + 1] = 61 + Math.round(stone * 37);
	data[offset + 2] = 55 + Math.round(stone * 31);
	data[offset + 3] = 255;
}
