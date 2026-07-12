// B"H

/** Rebuilds the current map projection from immutable source plus player deltas. */
export function createMapContext(staticMaps) {
	let activeMap = null;
	let activeMapId = null;

	function getSourceMap(state) {
		return state.generatedMaps?.[state.currentMapId]
			|| staticMaps[state.currentMapId]
			|| staticMaps.malkuth_village;
	}

	function current(state) {
		if (state.currentMapId === activeMapId && activeMap) return activeMap;
		const source = getSourceMap(state);
		const changes = state.player?.mapChanges?.[state.currentMapId] || {};
		const interactables = { ...(source.interactables || {}) };
		for (const [key, change] of Object.entries(changes)) {
			if (change === 'DELETED') delete interactables[key];
			else interactables[key] = { ...interactables[key], ...change };
		}
		activeMap = { ...source, interactables };
		activeMapId = state.currentMapId;
		return activeMap;
	}

	return {
		current,
		update(state) {
			state.maps = { [state.currentMapId]: current(state) };
			return state.maps[state.currentMapId];
		},
		invalidate() {
			activeMap = null;
			activeMapId = null;
		}
	};
}
