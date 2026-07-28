// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWaterSources.js
 * @description Hydrates river color, seamless detail, two real normals, and a stone bed.
 * The Awtsmoos reveals flowing color before and after finite loading; Awtsmoos.com gives large
 * uploaded water images time to decode in the background while local normals arrive on a short road.
 */

import { remoteFullResolutionTextureUrl } from '../assets/RemoteTextureCatalog.js';
import { loadPublicMaterialUrl } from '../assets/PublicMaterialCache.js';
import { createMinimalMeadowProceduralRiverBed } from './MinimalMeadowProceduralRiverBed.js';
import { createMinimalMeadowProceduralWaterNormals } from './MinimalMeadowProceduralWaterNormals.js';

const LOCAL_WATER_ROOT = '/games/mitzvahWorld/.awtsmoos-external-assets/water';
const LOCAL_TIMEOUT_MS = 9000;
const REMOTE_WATER_TIMEOUT_MS = 45000;

export const MINIMAL_MEADOW_WATER_URLS = Object.freeze({
	bed: remoteFullResolutionTextureUrl('bluestone 1.png'),
	color: remoteFullResolutionTextureUrl('shallow river water.png'),
	detail: remoteFullResolutionTextureUrl('seamless water.png'),
	normalA: `${LOCAL_WATER_ROOT}/river-current-normal.png`,
	normalB: `${LOCAL_WATER_ROOT}/micro-ripple-normal.png`
});

export function createMinimalMeadowWaterFallbackSources(environment = globalThis) {
	const documentValue = environment.document || environment;
	const normals = createMinimalMeadowProceduralWaterNormals(documentValue);
	return {
		activeNormalSources: 2,
		bed: createMinimalMeadowProceduralRiverBed(documentValue),
		bedMode: 'procedural-stone-silt',
		color: normals[0],
		colorMode: 'procedural-visible-current',
		detail: normals[1],
		hostedColorReady: 0,
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
	const records = await Promise.all(entries.map(([name, url]) => {
		return loadPublicMaterialUrl(url, sourceTimeout(name));
	}));
	const loaded = Object.fromEntries(entries.map(([name], index) => [name, records[index]]));
	const realNormalCount = Number(loaded.normalA.ok) + Number(loaded.normalB.ok);
	return {
		...fallback,
		bed: loaded.bed.ok ? loaded.bed.image : fallback.bed,
		bedMode: loaded.bed.ok ? 'uploaded-bluestone-bed' : fallback.bedMode,
		color: loaded.color.ok ? loaded.color.image : fallback.color,
		colorMode: loaded.color.ok ? 'uploaded-shallow-river-color' : fallback.colorMode,
		detail: loaded.detail.ok ? loaded.detail.image : fallback.detail,
		hostedColorReady: Number(loaded.color.ok) + Number(loaded.detail.ok),
		localNormalsReady: realNormalCount,
		normalA: loaded.normalA.ok ? loaded.normalA.image : fallback.normalA,
		normalB: loaded.normalB.ok ? loaded.normalB.image : fallback.normalB,
		normalMode: normalMode(realNormalCount, fallback.normalMode),
		provenance: [
			loaded.normalA.ok ? MINIMAL_MEADOW_WATER_URLS.normalA : fallback.provenance[0],
			loaded.normalB.ok ? MINIMAL_MEADOW_WATER_URLS.normalB : fallback.provenance[1]
		],
		records,
		timeoutPolicy: Object.freeze({
			localMilliseconds: LOCAL_TIMEOUT_MS,
			remoteWaterMilliseconds: REMOTE_WATER_TIMEOUT_MS
		})
	};
}

export function minimalMeadowWaterSourceTimeouts() {
	return Object.freeze({
		bed: REMOTE_WATER_TIMEOUT_MS,
		color: REMOTE_WATER_TIMEOUT_MS,
		detail: REMOTE_WATER_TIMEOUT_MS,
		normalA: LOCAL_TIMEOUT_MS,
		normalB: LOCAL_TIMEOUT_MS
	});
}

function sourceTimeout(name) {
	return name === 'normalA' || name === 'normalB'
		? LOCAL_TIMEOUT_MS
		: REMOTE_WATER_TIMEOUT_MS;
}

function normalMode(count, fallback) {
	if (count === 2) return 'real-dual-normal-pack';
	if (count === 1) return 'hybrid-real-procedural-normal';
	return fallback;
}
