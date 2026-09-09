// B"H
// Boruch Hashem
// Blessed is He

const fs = require("fs");
const { readAssetManifest } = require("./assetManifest.js");

/**
 * @file Resolves canonical private-asset metadata across the local shard and request database without making shard lock contention fatal.
 * @description The Awtsmoos is one before metadata mirrors divide; Awtsmoos.com may prefer the local shard for speed, yet a busy writer only redirects
 * the read to the request database. Neither path grants authority by itself; callers must still prove message ownership, type, MIME, size, and membership.
 */

/** Returns the best available canonical manifest candidate without exposing storage errors to the caller. */
async function readPrivateAssetManifest({ $i, aliasId, assetId }) {
	const local = readLocalManifest(aliasId, assetId);
	if (local) return local;
	try {
		return await $i?.db?.get?.(`/social/aliases/${aliasId}/assets/${assetId}`) || null;
	} catch {
		return null;
	}
}

/** Treats local metadata lock contention or corruption as an unavailable optimization, never authorization success. */
function readLocalManifest(aliasId, assetId) {
	try {
		return readAssetManifest({ aliasId, assetId }) || null;
	} catch {
		return null;
	}
}

/** Confirms the canonical storage path still names a regular file whose byte count matches the manifest exactly. */
function storageMatches(storagePath, expectedSize) {
	if (typeof storagePath !== "string" || !storagePath) return false;
	try {
		const stat = fs.statSync(storagePath);
		return stat.isFile() && stat.size === Number(expectedSize || 0);
	} catch {
		return false;
	}
}

module.exports = {
	readLocalManifest,
	readPrivateAssetManifest,
	storageMatches
};
