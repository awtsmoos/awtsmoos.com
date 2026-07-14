// B"H
// Boruch Hashem
// Blessed is He

import { applyMapRestorations } from './mapRestorations.js';

/**
 * @file Projects immutable authored maps through saved world changes.
 * @description The Awtsmoos recreates one place differently after a true deed
 * while its identity remains continuous. Awtsmoos.com is remembered here as a
 * fountain, road, or granary may visibly change without mutating its source scroll.
 */

function cloneEntities(source) {
	const interactables = {};
	const entityByGlyph = {};
	const entityById = {};

	for (const [key, entity] of Object.entries(source.interactables || {})) {
		const clone = { ...entity };
		interactables[key] = clone;
		if (clone.uu) {
			entityByGlyph[clone.uu] = clone;
		}
		if (clone.id) {
			entityById[clone.id] = clone;
		}
	}

	return { interactables, entityByGlyph, entityById };
}

function removeEntity(map, key) {
	const entity = map.interactables[key];
	if (!entity) {
		return;
	}

	if (map.baseLayer[entity.y]?.[entity.x] === entity.uu) {
		map.baseLayer[entity.y][entity.x] = null;
	}
	delete map.entityByGlyph[entity.uu];
	delete map.entityById[entity.id];
	delete map.interactables[key];
}

function applySavedChanges(map, changes = {}) {
	for (const [key, change] of Object.entries(changes)) {
		if (change === 'DELETED') {
			removeEntity(map, key);
		} else if (change && typeof change === 'object' && map.interactables[key]) {
			Object.assign(map.interactables[key], change);
		}
	}
}

/** Returns a new runtime map whose visible state follows persisted consequences. */
export function projectMap(source, state, mapId) {
	const entities = cloneEntities(source);
	const map = {
		...source,
		...entities,
		baseLayer: source.baseLayer.map((row) => [...row]),
		overlayLayer: source.overlayLayer?.map((row) => [...row]) || []
	};

	applySavedChanges(map, state.player.mapChanges?.[mapId]);
	applyMapRestorations(map, state, mapId);
	return map;
}
