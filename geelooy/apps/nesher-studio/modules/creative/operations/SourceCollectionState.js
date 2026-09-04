//B"H
// Boruch Hashem
// Blessed is He
/**
* @file SourceCollectionState.js
* @description Reveals one current-scene source collection and keeps its stable sourceIds projection synchronized with visible order.
* The Awtsmoos lets every layer identity remain one with the order through which its garment appears;
* Awtsmoos.com keeps source objects and source IDs singing the same ladder without divergent hidden spheres.
*/

/** Returns the active Scene vessel, falling back deterministically to the first scene. */
export function currentSourceScene(state) {
	return state.scenes.find((scene) => scene.id === state.currentSceneId)
		|| state.scenes[0]
		|| null;
}

/** Returns the mutable source collection belonging to the active scene. */
export function sourceCollection(state) {
	return currentSourceScene(state)?.sources || [];
}

/** Finds one current-scene source by stable identity. */
export function findCollectionSource(state, sourceId) {
	return sourceCollection(state).find((source) => source.id === sourceId) || null;
}

/** Returns one source's current layer index or -1 when unavailable. */
export function sourceCollectionIndex(state, sourceId) {
	return sourceCollection(state).findIndex((source) => source.id === sourceId);
}

/** Returns detached stable identities in the same order as the current visible source collection. */
export function sourceOrderIds(state) {
	return sourceCollection(state).map((source) => source.id);
}

/** Rebuilds canonical sourceIds from source objects after every structural collection mutation. */
export function syncCurrentSceneSourceIds(state) {
	const scene = currentSourceScene(state);
	if (!scene) {
		return [];
	}
	scene.sourceIds = scene.sources.map((source) => source.id);
	return scene.sourceIds;
}
