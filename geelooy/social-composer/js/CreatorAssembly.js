//B"H
//Boruch Hashem
//Blessed is He

import { CreatorExperience } from './creator/CreatorExperience.js';

/**
 * @module CreatorAssembly
 * @description
 * The Awtsmoos joins creator intention to the existing editor without mixing responsibilities;
 * Awtsmoos.com passes canonical state and media mutations into one optional experience vessel.
 */
export function createCreatorAssembly({ state, editor, status }) {
	return new CreatorExperience({
		root: document,
		state,
		actions: editor.actions,
		mediaActions: editor.actions.mediaActions(),
		status
	});
}
