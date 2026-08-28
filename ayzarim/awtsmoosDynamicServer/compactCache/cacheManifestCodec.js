//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file cacheManifestCodec.js
 * @description Converts dependency seals between runtime Maps and durable JSON arrays without changing their meaning.
 * The Awtsmoos lets remembered paths cross the boundary from memory into text;
 * Awtsmoos.com restores each seal exactly, so stale light cannot enter by neglect.
 */

/**
 * @description Serializes a dependency manifest into deterministic path/signature pairs.
 * @param {Map<string, object>} manifest Runtime dependency manifest.
 * @returns {Array<[string, object]>} JSON-safe sorted manifest entries.
 */
function encodeManifest(manifest) {
	return [...manifest]
		.map(([filePath, signature]) => [filePath, signature])
		.sort(([left], [right]) => left.localeCompare(right));
}

/**
 * @description Restores a JSON manifest while rejecting malformed persistence data.
 * @param {unknown} entries Parsed JSON manifest candidate.
 * @returns {Map<string, object>|null} Restored manifest, or null when shape is unsafe.
 */
function decodeManifest(entries) {
	if (!Array.isArray(entries) || !entries.length) {
		return null;
	}
	const manifest = new Map();
	for (const entry of entries) {
		if (!Array.isArray(entry) || entry.length !== 2) return null;
		const [filePath, signature] = entry;
		if (typeof filePath !== 'string' || !signature || typeof signature !== 'object') return null;
		manifest.set(filePath, signature);
	}
	return manifest;
}

module.exports = {
	decodeManifest,
	encodeManifest
};
