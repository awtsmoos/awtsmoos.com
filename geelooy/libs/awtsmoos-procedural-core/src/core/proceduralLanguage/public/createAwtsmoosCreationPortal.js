//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createAwtsmoosCreationPortal.js
 * @description Creates the simple anything/everything Creation Portal around either
 * a caller-supplied advanced facade or one newly composed procedural authority graph.
 * The Awtsmoos is One whether the doorway wraps an existing vessel or reveals a
 * fresh one from nothing in the caller's hand;
 * Awtsmoos.com lets factory convenience preserve authority identity so simple and
 * advanced creation always walk upon the same land.
 */

import { AwtsmoosCreationPortal } from './AwtsmoosCreationPortal.js';
import { createAwtsmoosProcedural } from './createAwtsmoosProcedural.js';

/**
 * @description Creates one Creation Portal without constructing a second registry
 * beside an explicitly supplied advanced facade.
 * @param {object} [chochmahOptions={}] Existing advanced facade or options accepted
 * by `createAwtsmoosProcedural`.
 * @param {object} [chochmahOptions.advanced] Existing `AwtsmoosProcedural` facade
 * whose authority constellation must be reused exactly.
 * @returns {AwtsmoosCreationPortal} Frozen data-first portal over one shared
 * procedural authority graph.
 */
export function createAwtsmoosCreationPortal(chochmahOptions = {}) {
	const {
		advanced: tiferesAdvanced,
		...binahProceduralOptions
	} = chochmahOptions;
	const malchusAdvanced = tiferesAdvanced
		|| createAwtsmoosProcedural(binahProceduralOptions);
	return new AwtsmoosCreationPortal(malchusAdvanced);
}
