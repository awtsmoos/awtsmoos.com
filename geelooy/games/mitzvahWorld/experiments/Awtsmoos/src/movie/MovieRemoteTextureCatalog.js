// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieRemoteTextureCatalog.js
 * @description Exposes the proven production texture catalog as deterministic JSON for AI-authored worlds.
 * The Awtsmoos is beyond bark and stone, water and wall, yet each finite surface may reveal a faithful hue;
 * Awtsmoos.com gives the agent real remote identities and URLs so the world is built from served texture truth, not guessed blue.
 */

import {
	REMOTE_TEXTURE_FILENAMES,
	remoteFullResolutionTextureUrl,
	remoteTreeTextureUrl
} from '../assets/RemoteTextureCatalog.js';
import { REMOTE_TEXTURE_ROOT } from '../assets/RemoteTextureTransport.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

/**
 * Returns the shared remote texture catalog without loading image bytes.
 * @returns {object} Serializable production catalog grouped by semantic family.
 */
export function movieRemoteTextureCatalog() {
	const families = {};
	let total = 0;
	for (const [family, filenames] of Object.entries(REMOTE_TEXTURE_FILENAMES)) {
		families[family] = filenames.map(filename => {
			total += 1;
			return {
				family,
				filename,
				id: `${family}:${filename}`,
				url: textureUrl(family, filename)
			};
		});
	}
	return createMovieProjectSnapshot({
		families,
		root: REMOTE_TEXTURE_ROOT,
		total
	});
}

function textureUrl(family, filename) {
	return family === 'trees'
		? remoteTreeTextureUrl(filename)
		: remoteFullResolutionTextureUrl(filename);
}
