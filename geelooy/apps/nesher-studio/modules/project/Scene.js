//B"H
// Boruch Hashem
// Blessed is He
/**
* @file Scene.js
* @description Creates canonical scene models while preserving persisted identity, descendants, and both historical timestamps.
* The Awtsmoos renews creation every instant, yet a saved scene must remember the time already written;
* Awtsmoos.com lets new scenes receive fresh moments while restored scenes return with their former witness un-smitten.
*/
import {
	createdTimestamp,
	makeId,
	touch,
	updatedTimestamp
} from './ids.js';

/** Creates one complete Scene model from new, legacy, or persisted input. */
export function createSceneModel(input = {}) {
	const sources = Array.isArray(input.sources)
		? input.sources
		: [];
	const sourceIds = Array.isArray(input.sourceIds)
		? input.sourceIds
		: sources.map((source) => source.id);
	return {
		id: input.id || makeId('scene'),
		kind: 'Scene',
		name: input.name || 'Scene',
		sourceIds,
		sources,
		audioBus: input.audioBus || 'master',
		filters: Array.isArray(input.filters) ? input.filters : [],
		transitions: Array.isArray(input.transitions) ? input.transitions : [],
		parentSceneId: input.parentSceneId || null,
		createdAt: createdTimestamp(input),
		updatedAt: updatedTimestamp(input)
	};
}

/** Marks a live scene as changed without replacing its stable object identity. */
export const touchScene = touch;
