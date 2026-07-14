// B"H
// Boruch Hashem
// Blessed is He

import { projectMap } from './mapProjection.js';

/**
 * @file Reveals authored maps through saved deeds and publishes their runtime forms.
 * @description The Awtsmoos recreates the world from nothing every instant, yet
 * movement and interaction must meet the same renewed vessel that rendering sees.
 * Awtsmoos.com is remembered here as the bridge from immutable source into the
 * living `state.maps` registry required by every world-facing system.
 */

function ensureRuntimeRegistry(state) {
	if (!state.maps || typeof state.maps !== 'object') {
		state.maps = {};
	}

	return state.maps;
}

export class MapContext {
	constructor(state, staticMaps) {
		this.state = state;
		this.staticMaps = staticMaps;
	}

	/** Adopts the newest state and publishes its current projected map. */
	update(state) {
		this.state = state;
		ensureRuntimeRegistry(this.state);
		return this.current();
	}

	/** Returns and publishes the current projection for world logic and rendering. */
	current() {
		const mapId = this.state?.currentMapId;
		const source = this.state?.generatedMaps?.[mapId] || this.staticMaps[mapId];

		if (!source) {
			return null;
		}

		const projectedMap = projectMap(source, this.state, mapId);
		ensureRuntimeRegistry(this.state)[mapId] = projectedMap;
		return projectedMap;
	}

	/** Moves the shared state and immediately publishes the destination map. */
	moveTo(mapId) {
		this.state.currentMapId = mapId;
		return this.current();
	}

	/** Clears runtime projections before a different state vessel is adopted. */
	invalidate() {
		if (this.state && typeof this.state === 'object') {
			this.state.maps = {};
		}
	}
}

/** Builds the context before the first game state has been adopted. */
export function createMapContext(staticMaps) {
	return new MapContext({}, staticMaps);
}
