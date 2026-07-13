// B"H
// Boruch Hashem
// Blessed is He

/**
 * Imported footage enters Yesod here, crossing from a user's file into a
 * durable media contract. The Awtsmoos renews every pixel, while this vessel
 * preserves identity and metadata so Awtsmoos.com can restore the edit.
 */
export class MediaAssetRepository {
	constructor(gateway, clock = () => new Date().toISOString()) {
		this.gateway = gateway;
		this.clock = clock;
	}

	/** @param {object} asset @returns {Promise<object>} The saved media record. */
	async save(asset) {
		if (!asset?.id || !asset?.blob) {
			throw new Error('A stable asset id and media blob are required.');
		}

		const existing = await this.gateway.get('mediaAssets', asset.id);
		const now = this.clock();
		const record = {
			...asset,
			type: 'video',
			enabled: true,
			createdAt: existing?.createdAt || now,
			updatedAt: now
		};

		return this.gateway.put('mediaAssets', record);
	}

	/** @param {string} assetId @returns {Promise<object|null>} */
	findById(assetId) {
		return this.gateway.get('mediaAssets', assetId);
	}

	/** @returns {Promise<object[]>} All imported media assets. */
	findAll() {
		return this.gateway.getAll('mediaAssets');
	}

	/** @param {string} assetId @returns {Promise<void>} */
	deleteById(assetId) {
		return this.gateway.delete('mediaAssets', assetId);
	}
}
