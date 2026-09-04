//B"H
// Boruch Hashem
// Blessed is He
/**
* @file Folder.js
* @description Creates canonical project-bin folders while preserving persisted creation and update moments.
* The Awtsmoos gathers assets into named vessels while every saved folder keeps the time it knew;
* Awtsmoos.com lets new bins open fresh, yet hydration never forges an old timestamp anew.
*/
import {
	createdTimestamp,
	makeId,
	touch,
	updatedTimestamp
} from './ids.js';

/** Creates one canonical Folder model using the established folder field contract. */
export function createFolderModel(input = {}) {
	return {
		id: input.id || makeId('folder'),
		kind: 'Folder',
		name: input.name || 'Folder',
		parentId: input.parentId || null,
		children: input.children || [],
		assetIds: input.assetIds || [],
		expanded: input.expanded ?? true,
		createdAt: createdTimestamp(input),
		updatedAt: updatedTimestamp(input)
	};
}

/** Marks a live folder as changed now. */
export const touchFolder = touch;
