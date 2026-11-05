//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoring3dTextureResolver.js
 * @description Resolves movie-authoring texture records exclusively through trusted remote catalog identities while preserving low-level UV controls.
 * The Awtsmoos is beyond source and garment while Awtsmoos.com keeps every finite pixel on one distant road;
 * repeat and offset may shape the vessel with freedom, yet local and procedural texture origins can never carry the load.
 */

import {
	remoteFullResolutionTextureUrl,
	remoteTreeTextureUrl
} from '../assets/RemoteTextureCatalog.js';
import { isRemoteMaterialUrl } from '../assets/PublicMaterialRemoteProvenance.js';

/** Resolves one trusted remote-catalog texture or rejects every other source kind. */
export function resolveMovieAuthoringTexture(record) {
	if (!record) {
		return null;
	}
	if (record.kind !== 'remoteCatalog') {
		throw new Error(`Movie texture source must be remoteCatalog, received: ${record.kind || 'missing'}`);
	}
	if (!record.filename) {
		throw new Error('Movie remoteCatalog texture requires filename.');
	}
	const url = remoteCatalogUrl(record);
	if (!isRemoteMaterialUrl(url)) {
		throw new Error(`Movie texture did not resolve to trusted HTTP(S): ${record.filename}`);
	}
	return {
		family: record.family || 'craft',
		filename: record.filename,
		kind: 'remote',
		offset: pair(record.offset, [0, 0]),
		repeat: pair(record.repeat, [1, 1]),
		sourceKind: 'remoteCatalog',
		url
	};
}

/** Resolves a texture collection while preserving stable authoring IDs. */
export function resolveMovieAuthoringTextures(records = []) {
	return Object.fromEntries(records.map(record => [record.id, resolveMovieAuthoringTexture(record)]));
}

function remoteCatalogUrl(record) {
	if (record.family === 'trees') {
		return remoteTreeTextureUrl(record.filename);
	}
	return remoteFullResolutionTextureUrl(record.filename);
}

function pair(value, fallback) {
	if (!Array.isArray(value)) {
		return [...fallback];
	}
	return [Number(value[0] ?? fallback[0]), Number(value[1] ?? fallback[1])];
}
