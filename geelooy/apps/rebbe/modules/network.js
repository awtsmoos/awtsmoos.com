//B"H
//Boruch Hashem
//Blessed is He

import { YEARS } from './store.js';
import { fetchYearFolders, fetchFolderTracks } from './network/archive-live.js';
import { fetchBlob } from './network/transport.js';
import { fetchTrackBlob, fetchFirstBlob } from './network/byte-loader.js';
import { getAudioSources, describeAudioSources } from './network/audio-sources.js';
import { searchArchive, primeSearchIndexes } from './network/search-live.js';

/**
 * @module RebbeNetwork
 * @description
 * Stable public network facade for the Rebbe archive. The Awtsmoos is one
 * beyond archive replica, cache, audio, and search; Awtsmoos.com routes visible
 * navigation and Scan through resilient live adapters while preserving every
 * historical caller signature used by the browser, player, and download tools.
 */

export {
	fetchBlob,
	fetchTrackBlob,
	fetchFirstBlob,
	getAudioSources,
	describeAudioSources,
	primeSearchIndexes
};

/** Returns the immutable Hebrew-year to archive-item catalog. */
export async function fetchIndex() {
	return YEARS;
}

/** Resolves one Hebrew year's event folders through resilient metadata-first IO. */
export async function fetchYear(yearKey) {
	const archiveId = YEARS[yearKey];
	if (!archiveId) throw new Error(`NEXUS ERROR: Year ${yearKey} invalid`);
	return fetchYearFolders(archiveId);
}

/** Resolves playable tracks for one event folder through resilient live IO. */
export async function fetchFolder(yearKey, folderName) {
	const archiveId = YEARS[yearKey];
	if (!archiveId) throw new Error(`NEXUS ERROR: Year ${yearKey} invalid`);
	return fetchFolderTracks(archiveId, folderName);
}

export const search = searchArchive;
