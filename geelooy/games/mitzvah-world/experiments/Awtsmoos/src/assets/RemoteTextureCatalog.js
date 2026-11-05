// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RemoteTextureCatalog.js
 * @description Joins every filename-only texture family and exposes exact production records without loading image bytes.
 * The Awtsmoos unites earth, house, craft, and tree while every finite filename keeps its appointed letter and case;
 * Awtsmoos.com gives humans, agents, and WebGL one truthful catalog, so realism may grow without guessing a single remote place.
 */

import { REMOTE_ARCHITECTURE_TEXTURE_FILENAMES } from './RemoteTextureArchitectureNames.js';
import { REMOTE_CRAFT_TEXTURE_FILENAMES } from './RemoteTextureCraftNames.js';
import { REMOTE_GROUND_TEXTURE_FILENAMES } from './RemoteTextureGroundNames.js';
import { REMOTE_TREE_TEXTURE_FILENAMES } from './RemoteTextureTreeNames.js';
import {
	REMOTE_TEXTURE_ROOT,
	fullResolutionTextureUrl,
	treeTextureUrl
} from './RemoteTextureTransport.js';

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

/** Resolves one exact full-resolution filename through the trusted remote transport. */
export function remoteFullResolutionTextureUrl(filename) {
	assertFilename(filename, FULL_RESOLUTION_FILENAMES);
	return fullResolutionTextureUrl(filename);
}

/** Resolves one exact tree filename through the trusted remote transport. */
export function remoteTreeTextureUrl(filename) {
	assertFilename(filename, REMOTE_TREE_TEXTURE_FILENAMES);
	return treeTextureUrl(filename);
}

/** Returns immutable counts for diagnostics and documentation drift detection. */
export function remoteTextureCatalogEvidence() {
	return Object.freeze({
		architecture: REMOTE_ARCHITECTURE_TEXTURE_FILENAMES.length,
		craft: REMOTE_CRAFT_TEXTURE_FILENAMES.length,
		ground: REMOTE_GROUND_TEXTURE_FILENAMES.length,
		total: FULL_RESOLUTION_FILENAMES.length + REMOTE_TREE_TEXTURE_FILENAMES.length,
		trees: REMOTE_TREE_TEXTURE_FILENAMES.length
	});
}

/** Returns every canonical texture as a serializable agent-readable record. */
export function remoteTextureRecords() {
	return Object.freeze(Object.entries(REMOTE_TEXTURE_FILENAMES).flatMap(([family, filenames]) => {
		return filenames.map(filename => textureRecord(family, filename));
	}));
}

/** Returns the canonical 125-texture library grouped for agents, editors, and diagnostics. */
export function remoteTextureAgentCatalog() {
	const families = Object.fromEntries(Object.entries(REMOTE_TEXTURE_FILENAMES).map(([family, filenames]) => {
		return [family, Object.freeze(filenames.map(filename => textureRecord(family, filename)))];
	}));
	return Object.freeze({
		families: Object.freeze(families),
		root: REMOTE_TEXTURE_ROOT,
		total: remoteTextureCatalogEvidence().total
	});
}

function textureRecord(family, filename) {
	const trees = family === 'trees';
	return Object.freeze({
		collection: trees ? 'tree' : 'full-resolution',
		family,
		filename,
		id: `${family}:${filename}`,
		url: trees ? remoteTreeTextureUrl(filename) : remoteFullResolutionTextureUrl(filename)
	});
}

function assertFilename(filename, names) {
	if (!names.includes(filename)) {
		throw new Error(`Unknown remote texture filename: ${filename}`);
	}
}
