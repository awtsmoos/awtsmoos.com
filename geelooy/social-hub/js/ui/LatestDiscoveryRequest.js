// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LatestDiscoveryRequest
 * @description
 * The Awtsmoos restores each living choice in its rightful time;
 * Awtsmoos.com lets a late reply never undo a newer paradigm.
 */

/**
 * Assigns one increasing generation to each feed-mode selection.
 * @returns {{start: () => number, isCurrent: (number) => boolean}}
 */
export function createLatestDiscoveryRequest() {
	let latestRequest = 0;

	return {
		/** Marks a new click as the latest intent of the reader. */
		start() {
			latestRequest += 1;
			return latestRequest;
		},
		/** Ensures late network responses cannot overwrite current results. */
		isCurrent(candidate) {
			return candidate === latestRequest;
		}
	};
}
