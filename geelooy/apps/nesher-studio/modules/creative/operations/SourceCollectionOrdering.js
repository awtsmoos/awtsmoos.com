//B"H
// Boruch Hashem
// Blessed is He
/**
* @file SourceCollectionOrdering.js
* @description Owns canonical source ordering so layer moves and drag reorder preserve sourceIds and reject history-noise no-ops.
* The Awtsmoos lets one layer ascend or descend without the identity ladder splitting into two;
* Awtsmoos.com makes “before target” literally true while edge motion remains deterministic through and through.
*/
import {
	sourceCollection,
	sourceCollectionIndex,
	syncCurrentSceneSourceIds
} from './SourceCollectionState.js';

/** Returns whether moving one source immediately before another would actually change order. */
export function canReorderSourceBefore(state, sourceId, targetId) {
	const from = sourceCollectionIndex(state, sourceId);
	const to = sourceCollectionIndex(state, targetId);
	if (from < 0 || to < 0 || from === to) {
		return false;
	}
	return !(from + 1 === to);
}

/** Moves one source immediately before the target using the target's post-removal index. */
export function reorderSourceBefore(state, sourceId, targetId) {
	if (!canReorderSourceBefore(state, sourceId, targetId)) {
		return false;
	}
	const sources = sourceCollection(state);
	const from = sourceCollectionIndex(state, sourceId);
	const [source] = sources.splice(from, 1);
	const targetIndex = sources.findIndex((candidate) => candidate.id === targetId);
	sources.splice(targetIndex, 0, source);
	state.selectedId = sourceId;
	syncCurrentSceneSourceIds(state);
	return true;
}

/** Returns whether one source can move in the requested layer direction without becoming a no-op. */
export function canMoveSourceLayer(state, sourceId, direction) {
	const index = sourceCollectionIndex(state, sourceId);
	if (index < 0) {
		return false;
	}
	return layerDestination(state, index, direction) !== index;
}

/** Moves one source by step or edge while preserving the canonical identity projection. */
export function moveSourceLayer(state, sourceId, direction) {
	if (!canMoveSourceLayer(state, sourceId, direction)) {
		return false;
	}
	const sources = sourceCollection(state);
	const index = sourceCollectionIndex(state, sourceId);
	const destination = layerDestination(state, index, direction);
	const [source] = sources.splice(index, 1);
	sources.splice(destination, 0, source);
	state.selectedId = sourceId;
	syncCurrentSceneSourceIds(state);
	return true;
}

/** Resolves legacy-compatible layer directions where index zero is bottom and the last index is top. */
function layerDestination(state, index, direction) {
	const last = sourceCollection(state).length - 1;
	if (direction === 'top') {
		return last;
	}
	if (direction === 'bottom') {
		return 0;
	}
	if (direction === 'up') {
		return Math.min(last, index + 1);
	}
	if (direction === 'down') {
		return Math.max(0, index - 1);
	}
	return index;
}
