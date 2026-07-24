// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterSources.js
 * @description Prefers hosted normals and photographic stone, with deterministic canvas fallbacks.
 * The Awtsmoos lets current and bed remain truthful when cache or hosting vessels sleep;
 * Awtsmoos.com records two active fields, bed provenance, hosted availability, and fallback mode.
 */

import { cachedTextureImage, loadPublicMaterialUrl } from '../assets/PublicMaterialCache.js';
import { TEXTURE_URLS } from '../assets/TextureCatalog.js';
import { createMinimalMeadowProceduralWaterNormals } from './MinimalMeadowProceduralWaterNormals.js?v=20260724-meadow-21';

const HOST = 'https://awtsmoos-docs-base.web.app/awtsmoos-assets/mitzvah-world/environment-v1/water';

export const MINIMAL_MEADOW_WATER_URLS = Object.freeze({
	bed: TEXTURE_URLS.stone.fieldstone1,
	normalA: `${HOST}/flow-normal-a.png`,
	normalB: `${HOST}/flow-normal-b.png`
});

export async function loadMinimalMeadowWaterSources(environment = globalThis) {
	const urls = Object.values(MINIMAL_MEADOW_WATER_URLS);
	const records = await Promise.all(urls.map(url => loadPublicMaterialUrl(url, 12000)));
	const generatedNormals = createMinimalMeadowProceduralWaterNormals(environment.document);
	const hostedA = cachedTextureImage(MINIMAL_MEADOW_WATER_URLS.normalA);
	const hostedB = cachedTextureImage(MINIMAL_MEADOW_WATER_URLS.normalB);
	const photographicBed = cachedTextureImage(MINIMAL_MEADOW_WATER_URLS.bed);
	const hostedCount = Number(Boolean(hostedA)) + Number(Boolean(hostedB));
	return {
		activeNormalSources: 2,
		bed: photographicBed || createProceduralRiverBed(environment.document),
		bedMode: photographicBed ? 'photographic-stone' : 'procedural-stone-silt',
		hostedNormalsReady: hostedCount,
		normalA: hostedA || generatedNormals[0],
		normalB: hostedB || generatedNormals[1],
		normalMode: hostedCount === 2 ? 'firebase-hosted' : hostedCount === 1 ? 'hybrid' : 'procedural-quota-fallback',
		provenance: [
			hostedA ? MINIMAL_MEADOW_WATER_URLS.normalA : 'procedural://awtsmoos-water-normal/613',
			hostedB ? MINIMAL_MEADOW_WATER_URLS.normalB : 'procedural://awtsmoos-water-normal/991'
		],
		records,
		urls: MINIMAL_MEADOW_WATER_URLS
	};
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
			const offset = (y * canvas.width + x) * 4;
			const stone = stoneNoise(x, y);
			image.data[offset] = 52 + Math.round(stone * 42);
			image.data[offset + 1] = 61 + Math.round(stone * 37);
			image.data[offset + 2] = 55 + Math.round(stone * 31);
			image.data[offset + 3] = 255;
		}
	}
	context.putImageData(image, 0, 0);
	canvas.dataset.awtsmoosRiverBed = 'procedural-stone-silt';
	return canvas;
}

function stoneNoise(x, y) {
	const broad = Math.sin(x * 0.074) * Math.cos(y * 0.061) * 0.28;
	const pebbles = Math.sin((x + y) * 0.19) * Math.sin((x - y) * 0.13) * 0.22;
	const grit = Math.sin(x * 0.73 + y * 0.47) * 0.08;
	return Math.max(0, Math.min(1, 0.5 + broad + pebbles + grit));
}
