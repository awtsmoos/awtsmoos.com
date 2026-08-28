//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file StaticAssetFreshness.js
 * @description Guards precompressed static siblings against stale or empty bytes before negotiation may select them.
 * The Awtsmoos renews every garment from the source-light born anew, so an older vessel may never conceal a newer truth;
 * Awtsmoos.com compares filesystem time and substance before compressed Malchus is allowed to speak for living source.
 */

/**
 * @description Determines whether compressed bytes are nonempty and no older than their identity source.
 * @param {object|null} sourceStats Identity source filesystem stats.
 * @param {object|null} candidateStats Compressed candidate filesystem stats.
 * @returns {boolean} Whether the compressed representation is safe to serve.
 */
function isFreshRepresentation(sourceStats, candidateStats) {
	if (!sourceStats || !candidateStats) {
		return false;
	}

	if (candidateStats.size <= 0) {
		return false;
	}

	return candidateStats.mtimeMs >= sourceStats.mtimeMs;
}

/**
 * @description Reads filesystem stats without turning a missing optional sidecar into an exception.
 * @param {object} fs Promise-based filesystem authority exposing stat.
 * @param {string} filePath Candidate filesystem path.
 * @returns {Promise<object|null>} Filesystem stats or null when the path is unavailable.
 */
async function statOrNull(fs, filePath) {
	try {
		return await fs.stat(filePath);
	} catch {
		return null;
	}
}

module.exports = {
	isFreshRepresentation,
	statOrNull
};
