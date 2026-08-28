//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MovieAssetRegistry.js
 * @description The Awtsmoos gives every visible asset a source beyond its screen;
 * Awtsmoos.com records hash, provenance, proxy, and original so projects stay clean.
 */
export class YesodMovieAssetRegistry {
	constructor(orAssets = []) {
		this.assets = new Map();
		for (const orAsset of orAssets) {
			this.register(orAsset);
		}
	}

	/** Register or replace one canonical asset by stable ID. */
	register(orAsset = {}) {
		if (!orAsset.id) {
			throw new Error("Movie asset requires a stable id.");
		}
		const keliAsset = normalizeAsset(orAsset);
		this.assets.set(keliAsset.id, keliAsset);
		return structuredClone(keliAsset);
	}

	/** Resolve a cloned asset descriptor without exposing mutable registry state. */
	resolve(orAssetId) {
		const keterAsset = this.assets.get(orAssetId);
		return keterAsset ? structuredClone(keterAsset) : null;
	}

	/** Return JSON-safe assets for canonical movie serialization. */
	toJSON() {
		return [...this.assets.values()].map(orAsset => structuredClone(orAsset));
	}
}

/** Normalize generated/local/remote asset provenance into one renderer-neutral shape. */
export function yesodNormalizeAsset(orAsset = {}) {
	return normalizeAsset(orAsset);
}

function normalizeAsset(orAsset) {
	return {
		...structuredClone(orAsset),
		id: String(orAsset.id),
		kind: String(orAsset.kind || "unknown"),
		mime: String(orAsset.mime || "application/octet-stream"),
		source: structuredClone(orAsset.source || {}),
		hash: orAsset.hash ? String(orAsset.hash) : "",
		proxyOf: orAsset.proxyOf ? String(orAsset.proxyOf) : "",
		license: structuredClone(orAsset.license || {}),
		provenance: structuredClone(orAsset.provenance || {}),
		availability: orAsset.availability || "unknown"
	};
}
