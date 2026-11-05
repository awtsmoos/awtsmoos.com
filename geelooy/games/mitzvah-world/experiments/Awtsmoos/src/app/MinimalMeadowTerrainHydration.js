// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowTerrainHydration.js
 * @description Binds verified grass and road images progressively while final layered enrichment continues.
 * The Awtsmoos clothes earth at the first truthful pixel and completes every later garment in turn;
 * Awtsmoos.com keeps playable fallback immediate while grass and cobblestone visibly return.
 */

import {
	createMinimalMeadowTerrainComposites
} from './MinimalMeadowTerrainComposites.js';
import {
	configureMinimalTerrainDensity
} from './MinimalMeadowTerrainMaterialDensity.js';
import {
	loadMinimalMeadowTerrainSources,
	TEXTURES
} from './MinimalMeadowTerrainSources.js';

const TERRAIN_FALLBACK_COLOR = Object.freeze([0.24, 0.43, 0.21, 1]);
const ROAD_FALLBACK_COLOR = '#716957';
const SOURCE_TINT = Object.freeze([1, 1, 1, 1]);

export function createMinimalMeadowTerrainHydration(options) {
	let promise = null;
	const state = { error: null, failed: 0, loaded: 0, phase: 'deferred' };
	const diagnostics = () => Object.freeze({ ...state });
	const start = () => {
		promise ||= hydrate(options, state).catch(error => {
			state.error = error?.message || String(error);
			state.phase = 'degraded';
			return diagnostics();
		});
		return promise;
	};
	applyFallbackColors(options.mesh, options.road);
	return Object.freeze({ diagnostics, start });
}

async function hydrate(options, state) {
	state.phase = 'loading';
	const externalSettled = options.onTextureSettled;
	const sources = await (options.loadSources || loadMinimalMeadowTerrainSources)({
		...options,
		onTextureSettled(record, index, total) {
			applyProgressiveRecord(options, record);
			externalSettled?.(record, index, total);
		}
	});
	const composites = createMinimalMeadowTerrainComposites(sources.images);
	configureMinimalTerrainDensity(
		options.mesh.material,
		composites,
		options.size,
		options.mobile
	);
	if (composites.main) options.mesh.material.color = [...SOURCE_TINT];
	applyRoadSources(options.road, composites);
	options.mesh.material.needsUpdate = true;
	state.failed = sources.failed || 0;
	state.loaded = sources.loaded || 0;
	state.phase = sources.mode || (state.loaded ? 'partial' : 'degraded');
	state.error = null;
	return Object.freeze({ ...state });
}

function applyProgressiveRecord(options, record) {
	if (!record?.ok || !usableImage(record.image)) return;
	const url = record.url || record.primaryUrl || null;
	if (url === TEXTURES.grassFour || !usableImage(options.mesh.material.mapImage)) {
		bindImage(options.mesh.material, record.image, url, [...SOURCE_TINT]);
	}
	if (url === TEXTURES.roadCobblestone || url === TEXTURES.cobblestone) {
		bindImage(options.road.material, record.image, url, '#ffffff');
	}
}

function applyFallbackColors(mesh, road) {
	if (!mesh.material.mapImage) mesh.material.color = [...TERRAIN_FALLBACK_COLOR];
	if (!road.material.mapImage) road.material.color = ROAD_FALLBACK_COLOR;
	mesh.material.needsUpdate = true;
	road.material.needsUpdate = true;
}

function applyRoadSources(road, composites) {
	road.material.map = composites.path;
	road.material.mapImage = composites.path;
	road.material.textureUrl = composites.path?.src || null;
	road.material.color = composites.path ? '#ffffff' : ROAD_FALLBACK_COLOR;
	road.material.textureLayers = [
		layer('cobblestone-center', composites.path, 0.18, 1, [0, 1, 0, 0]),
		layer('dirt-grass-shoulder', composites.pathEdge, -0.62, 0.62, [0.2, 0.8, 0, 0]),
		layer('open-dirt-transition', composites.soil, 1.04, 0.38, [0.62, 0.38, 0, 0])
	].filter(record => record.image);
	road.material.needsUpdate = true;
}

function bindImage(material, image, textureUrl, color) {
	material.map = image;
	material.mapImage = image;
	material.textureUrl = textureUrl;
	material.color = color;
	material.needsUpdate = true;
}

function usableImage(image) {
	return Boolean(image) && Number(image.naturalWidth || image.width || 0) > 0;
}

function layer(role, image, angle, strength, zones) {
	return { angle, image, role, strength, zones };
}
