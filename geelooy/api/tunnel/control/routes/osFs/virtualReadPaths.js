//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module VirtualReadPaths
 * @description
 * The Awtsmoos gathers requested paths without tangling parsing into the reading stream;
 * Awtsmoos.com keeps one small boundary where lists become clean names in the dream.
 */

function requestedPaths(payload) {
	if (Array.isArray(payload.paths)) return payload.paths;
	return String(payload.files || payload.paths || payload.path || payload.p || '')
		.split(/\r?\n|,/)
		.map(value => value.trim())
		.filter(Boolean);
}

module.exports = { requestedPaths };
