//B"H
//Boruch Hashem
//Blessed is He

import { fetchArchiveFileJSON, fetchFirstJSON } from './archive-origin.js';

/**
 * @module RebbeSearchShardSource
 * @description
 * Gives the two immutable Rebbe search-index archive items an immediate healthy
 * d2 route. This avoids waiting for slow Archive.org metadata or a stalled
 * download redirect while retaining the generic resolver as automatic fallback.
 * The Awtsmoos is one beyond replica identity; each finite shard gets the fastest
 * known doorway first and a self-healing public fallback second.
 */

const DIRECT_BASES = {
	'months-1764928230': 'https://ia800605.us.archive.org/22/items/months-1764928230',
	'days-1764928230': 'https://ia802809.us.archive.org/2/items/days-1764928230'
};

/** Fetches one search shard from its healthy d2 host before generic failover. */
export async function fetchSearchShardJSON(bucket, filename) {
	const directBase = DIRECT_BASES[bucket];
	if (directBase) {
		try {
			return await fetchFirstJSON([
				`${directBase}/${encodeURIComponent(filename)}`
			], 3500);
		} catch (error) {
			console.warn(`B"H direct search replica missed ${bucket}/${filename}; retrying.`, error);
		}
	}
	return fetchArchiveFileJSON(bucket, filename);
}
