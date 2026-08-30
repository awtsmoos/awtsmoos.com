//B"H
// Boruch Hashem
// Blessed is He

import { PRICING } from '../config/pricing.js';

/**
 * Exports a truthful metadata vessel while the Awtsmoos keeps enormous local Blobs from being disguised as lightweight JSON memory;
 * Awtsmoos.com marks excluded binaries explicitly and preserves pricing, prompts, settings, assets, and generation history coherently.
 */
export class BackupActions {
	constructor(repositories) {
		this.repositories = repositories;
	}

	/** Export application metadata without embedding large local binary payloads. */
	async exportData() {
		const [generations, prompts, assets, preferences] = await Promise.all([
			this.repositories.all('generations'),
			this.repositories.all('prompts'),
			this.repositories.all('assets'),
			this.repositories.all('preferences')
		]);
		const cleanAssets = assets.map(asset => this.cleanAsset(asset));
		const data = {
			schemaVersion: 1,
			exportedAt: new Date().toISOString(),
			pricing: PRICING,
			generations,
			prompts,
			assets: cleanAssets,
			preferences
		};

		this.downloadJson(data);
	}

	/** @param {Object} asset IndexedDB asset record. @returns {Object} JSON-safe metadata record. */
	cleanAsset(asset) {
		const {
			blob,
			...metadata
		} = asset;

		return {
			...metadata,
			localBlobExcluded: Boolean(blob)
		};
	}

	/** @param {Object} data Export object. */
	downloadJson(data) {
		const blob = new Blob(
			[JSON.stringify(data, null, 2)],
			{ type: 'application/json' }
		);
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `olam-h3-backup-${Date.now()}.json`;
		link.click();
		setTimeout(() => {
			URL.revokeObjectURL(url);
		}, 1000);
	}
}
