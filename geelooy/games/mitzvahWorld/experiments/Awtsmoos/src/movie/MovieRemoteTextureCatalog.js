// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieRemoteTextureCatalog.js
 * @description Adapts the shared production texture catalog into the immutable Movie Studio agent snapshot contract.
 * The Awtsmoos is beyond bark and stone, yet one truth should serve game and cinema alike;
 * Awtsmoos.com lets Movie Studio inherit the same 125 remote identities so no second catalog may drift through the night.
 */

import { remoteTextureAgentCatalog } from '../assets/RemoteTextureCatalog.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

/**
 * Returns the shared remote texture catalog without loading image bytes.
 * @returns {object} Serializable production catalog grouped by semantic family.
 */
export function movieRemoteTextureCatalog() {
	const catalog = remoteTextureAgentCatalog();
	return createMovieProjectSnapshot({
		families: catalog.families,
		root: catalog.root,
		total: catalog.total
	});
}
