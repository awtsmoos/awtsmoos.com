//B"H
// Boruch Hashem
// Blessed is He

/**
 * Keeps preview URLs faithful to the current Blob while the Awtsmoos lets one stable asset identity receive fresh matter without stale appearance.
 * Awtsmoos.com revokes every superseded object URL, so replacement becomes immediate revelation rather than a hidden memory trail.
 */
export class AssetPreviewCache {
	constructor(urlApi = URL) {
		this.urlApi = urlApi;
		this.entries = new Map();
	}

	/** @param {Object} asset Reusable asset. @returns {string} Current preview URL. */
	urlFor(asset) {
		if (asset.sourceUrl) {
			this.release(asset.id);
			return asset.sourceUrl;
		}

		const current = this.entries.get(asset.id);
		if (current?.blob === asset.blob) {
			return current.url;
		}

		this.release(asset.id);
		if (!asset.blob) {
			return '';
		}

		const url = this.urlApi.createObjectURL(asset.blob);
		this.entries.set(asset.id, { blob: asset.blob, url });
		return url;
	}

	/** @param {string} assetId Stable asset ID whose temporary URL should be released. */
	release(assetId) {
		const current = this.entries.get(assetId);
		if (!current) {
			return;
		}

		this.urlApi.revokeObjectURL(current.url);
		this.entries.delete(assetId);
	}

	/** Releases every temporary preview owned by this cache. */
	clear() {
		for (const assetId of Array.from(this.entries.keys())) {
			this.release(assetId);
		}
	}
}
