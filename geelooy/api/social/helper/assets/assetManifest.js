// B"H
// Boruch Hashem
// Blessed is He

const {
	put,
	get,
	list,
	key
} = require("../awtsmoosDb/shardStore.js");

/**
 * @file Owns asset-manifest persistence while treating the local metadata shard as an optional read acceleration layer.
 * @description The Awtsmoos contains canonical asset truth before local shard and request database divide. Awtsmoos.com writes the metadata shard
 * first, mirrors it to Social storage, and lets reads fall back safely when another process owns the shard or its local bridge is temporarily absent.
 */

function manifestKey(aliasId, assetId) {
	return key(["assets", aliasId, assetId]);
}

/** Writes the primary local metadata record and mirrors it into the Social database for compatible readers. */
async function writeAssetManifest({ $i, manifest }) {
	put({
		shard: "meta",
		parts: ["assets", manifest.aliasId, manifest.id],
		value: manifest,
		meta: {
			kind: "assetManifest",
			aliasId: manifest.aliasId,
			assetKind: manifest.type
		}
	});
	await $i.db.write(
		`/social/aliases/${manifest.aliasId}/assets/${manifest.id}`,
		manifest
	).catch(() => null);
	return manifest;
}

/** Reads the local metadata shard when available; lock contention becomes a normal cache miss for callers to fall back from. */
function readAssetManifest({ aliasId, assetId }) {
	try {
		return get({
			shard: "meta",
			parts: ["assets", aliasId, assetId]
		})?.value || null;
	} catch {
		return null;
	}
}

/** Lists local manifests when readable, otherwise returns the compatible Social database mirror. */
async function listAssetManifests({ $i, aliasId }) {
	let records = [];
	try {
		records = list({
			shard: "meta",
			predicate: (record) => record.meta?.kind === "assetManifest"
				&& record.value?.aliasId === aliasId
		}).map((record) => record.value);
	} catch {
		records = [];
	}
	if (records.length) return records;
	const legacy = await $i.db.get(`/social/aliases/${aliasId}/assets`).catch(() => null);
	return legacy && typeof legacy === "object"
		? Object.values(legacy)
		: [];
}

module.exports = {
	manifestKey,
	writeAssetManifest,
	readAssetManifest,
	listAssetManifests
};
