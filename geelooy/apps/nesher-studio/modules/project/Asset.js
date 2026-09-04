//B"H
// Boruch Hashem
// Blessed is He
/**
* @file Asset.js
* @description Creates canonical media-asset records while preserving persisted temporal identity across hydration.
* The Awtsmoos lets an asset carry media, tags, proxies, and thumbnails while its saved time remains true;
* Awtsmoos.com gives every fresh asset a moment, yet hydration never paints an older witness new.
*/
import {
	createdTimestamp,
	makeId,
	touch,
	updatedTimestamp
} from './ids.js';

/** Creates one canonical Asset model without altering existing field defaults. */
export function createAssetModel(input = {}) {
	return {
		id: input.id || makeId('asset'),
		kind: 'Asset',
		name: input.name || 'Untitled asset',
		mediaKind: input.mediaKind || input.type || 'generated',
		uri: input.uri || null,
		folderId: input.folderId || null,
		duration: Number(input.duration || 0),
		offline: !!input.offline,
		metadata: input.metadata || {},
		proxies: input.proxies || [],
		thumbnails: input.thumbnails || [],
		mediaInfo: input.mediaInfo || {},
		tags: input.tags || [],
		createdAt: createdTimestamp(input),
		updatedAt: updatedTimestamp(input)
	};
}

/** Marks a live asset as changed now. */
export const touchAsset = touch;
