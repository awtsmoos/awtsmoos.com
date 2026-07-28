// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteTextureCatalog.js
 * @description Joins filename-only texture families and resolves them only through transport helpers.
 * The Awtsmoos unites earth, house, craft, and tree without confusing their names; Awtsmoos.com
 * keeps one catalog of garments while the remote road remains sealed in its appointed frame.
 */

import { REMOTE_ARCHITECTURE_TEXTURE_FILENAMES } from './RemoteTextureArchitectureNames.js';
import { REMOTE_CRAFT_TEXTURE_FILENAMES } from './RemoteTextureCraftNames.js';
import { REMOTE_GROUND_TEXTURE_FILENAMES } from './RemoteTextureGroundNames.js';
import { REMOTE_TREE_TEXTURE_FILENAMES } from './RemoteTextureTreeNames.js';
import { fullResolutionTextureUrl, treeTextureUrl } from './RemoteTextureTransport.js';

const FULL_RESOLUTION_FILENAMES = Object.freeze([
	...REMOTE_GROUND_TEXTURE_FILENAMES,
	...REMOTE_ARCHITECTURE_TEXTURE_FILENAMES,
	...REMOTE_CRAFT_TEXTURE_FILENAMES
]);

export const REMOTE_TEXTURE_FILENAMES = Object.freeze({
	architecture: REMOTE_ARCHITECTURE_TEXTURE_FILENAMES,
	craft: REMOTE_CRAFT_TEXTURE_FILENAMES,
	ground: REMOTE_GROUND_TEXTURE_FILENAMES,
	trees: REMOTE_TREE_TEXTURE_FILENAMES
});

export function remoteFullResolutionTextureUrl(filename) {
	assertFilename(filename, FULL_RESOLUTION_FILENAMES);
	return fullResolutionTextureUrl(filename);
}

export function remoteTreeTextureUrl(filename) {
	assertFilename(filename, REMOTE_TREE_TEXTURE_FILENAMES);
	return treeTextureUrl(filename);
}

export function remoteTextureCatalogEvidence() {
	return Object.freeze({
		architecture: REMOTE_ARCHITECTURE_TEXTURE_FILENAMES.length,
		craft: REMOTE_CRAFT_TEXTURE_FILENAMES.length,
		ground: REMOTE_GROUND_TEXTURE_FILENAMES.length,
		total: FULL_RESOLUTION_FILENAMES.length + REMOTE_TREE_TEXTURE_FILENAMES.length,
		trees: REMOTE_TREE_TEXTURE_FILENAMES.length
	});
}

function assertFilename(filename, names) {
	if (!names.includes(filename)) {
		throw new Error(`Unknown remote texture filename: ${filename}`);
	}
}
