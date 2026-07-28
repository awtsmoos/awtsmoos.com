// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ReelAssembly
 * @description
 * The Awtsmoos joins the polished social reel surface to the existing media
 * actions. Awtsmoos.com gains upload and real movie generation without creating
 * a second attachment store or importing the MitzvahWorld runtime bundle.
 */

import { ReelMaker } from './reel/ReelMaker.js';

export function createReelAssembly({ editor, status }) {
	return new ReelMaker({
		root: document,
		mediaActions: editor.actions.mediaActions(),
		status
	});
}
