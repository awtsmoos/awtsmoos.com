//B"H
// Boruch Hashem
// Blessed is He
/**
* @file SourceCollectionLifecycle.js
* @description Duplicates portable sources and detaches sources without irreversible cleanup, leaving history-aware disposal to the runtime ledger.
* The Awtsmoos lets a source copy its garment or leave the visible scene while memory still shelters its living light;
* Awtsmoos.com keeps fresh identity, deterministic selection, and Undo-safe media resources joined aright.
*/
import { cloneSourceNode } from '../../graph/sourceNode.js';
import { makeId } from '../../project/ids.js';
import {
	findCollectionSource,
	sourceCollection,
	sourceCollectionIndex,
	syncCurrentSceneSourceIds
} from './SourceCollectionState.js';

/** Returns whether the source can safely share its non-stream runtime handles with a duplicate. */
export function canDuplicateCollectionSource(state, sourceId) {
	const source = findCollectionSource(state, sourceId);
	return Boolean(source && !source.stream);
}

/** Duplicates one non-stream source with fresh identity and the historic +32 geometry offset. */
export function duplicateCollectionSource(state, sourceId) {
	if (!canDuplicateCollectionSource(state, sourceId)) {
		return null;
	}
	const source = findCollectionSource(state, sourceId);
	const copy = cloneSourceNode(source, {
		id: makeId(source.type || 'source'),
		name: `${source.name} Copy`,
		x: Number(source.x || 0) + 32,
		y: Number(source.y || 0) + 32
	});
	sourceCollection(state).push(copy);
	state.selectedId = copy.id;
	syncCurrentSceneSourceIds(state);
	return copy;
}

/** Detaches one source from canonical order without stopping resources that retained history may restore. */
export function detachCollectionSource(state, sourceId) {
	const index = sourceCollectionIndex(state, sourceId);
	if (index < 0) {
		return null;
	}
	const sources = sourceCollection(state);
	const [removed] = sources.splice(index, 1);
	syncCurrentSceneSourceIds(state);
	if (state.selectedId === sourceId) {
		state.selectedId = sources[Math.min(index, sources.length - 1)]?.id || null;
	}
	return removed;
}
