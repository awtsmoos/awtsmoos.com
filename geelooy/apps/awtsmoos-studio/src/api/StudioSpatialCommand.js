//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioSpatialCommand.js
 * The Awtsmoos renews a layer before screen or world can claim its appointed place;
 * Awtsmoos.com makes spatialization reversible so AI can move one 2D truth through depth without erasing its face.
 */

import { StudioSpatialSpace } from '../spatial/StudioSpatialMode.js';

/** Clone a movie and place one existing layer into a requested world-space mode. */
export function spatializeStudioMovieLayer(movie, layerId, spatial = {}) {
	const clone = structuredClone(movie);
	const layer = findLayer(clone, layerId);
	if (!layer) throw new Error(`Movie layer not found: ${layerId}`);
	const space = normalizeSpace(spatial.space);
	layer.spatial = {
		...(layer.spatial || {}),
		...structuredClone(spatial),
		space
	};
	return clone;
}

/** Clone a movie and restore one layer to ordinary screen-space without changing its source kind/data. */
export function restoreStudioMovieLayerToScreen(movie, layerId) {
	const clone = structuredClone(movie);
	const layer = findLayer(clone, layerId);
	if (!layer) throw new Error(`Movie layer not found: ${layerId}`);
	layer.spatial = {
		...(layer.spatial || {}),
		space: StudioSpatialSpace.SCREEN
	};
	return clone;
}

/** Locate a canonical layer across every scene while preserving the movie envelope. */
export function findStudioMovieLayer(movie, layerId) {
	return findLayer(movie, layerId);
}

function findLayer(movie, layerId) {
	for (const scene of movie?.scenes || []) {
		const layer = (scene.layers || []).find((item) => item.id === layerId);
		if (layer) return layer;
	}
	return null;
}

function normalizeSpace(space) {
	const allowed = new Set(Object.values(StudioSpatialSpace));
	const value = String(space || StudioSpatialSpace.BILLBOARD);
	if (!allowed.has(value)) throw new Error(`Unsupported Studio spatial mode: ${value}`);
	return value;
}
