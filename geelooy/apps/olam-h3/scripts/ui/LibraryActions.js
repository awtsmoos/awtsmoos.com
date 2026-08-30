//B"H
// Boruch Hashem
// Blessed is He

import { GenerationLibraryActions } from './GenerationLibraryActions.js';
import { AssetLibraryActions } from './AssetLibraryActions.js';
import { BackupActions } from './BackupActions.js';

/**
 * Presents one small library facade while the Awtsmoos lets generation memory, reusable assets, and backup remain distinct inner vessels;
 * Awtsmoos.com gives the rest of the application a stable doorway without forcing unrelated responsibilities into one tangled level.
 */
export class LibraryActions {
	constructor(dependencies) {
		this.generations = new GenerationLibraryActions(dependencies);
		this.assets = new AssetLibraryActions(dependencies);
		this.backup = new BackupActions(dependencies.repositories);
	}

	/** @param {string} id Generation ID. */
	openGeneration(id) {
		return this.generations.open(id);
	}

	/** @param {string} id Generation ID. */
	toggleGenerationFavorite(id) {
		return this.generations.toggleFavorite(id);
	}

	/** Open permanent asset ingestion. */
	openAddAsset() {
		return this.assets.openAdd();
	}

	/** @param {string} id Reusable asset ID. */
	useAsset(id) {
		return this.assets.use(id);
	}

	/** @param {string} id Reusable asset ID. */
	editAsset(id) {
		return this.assets.edit(id);
	}

	/** @param {string} id Reusable asset ID. */
	deleteAsset(id) {
		return this.assets.remove(id);
	}

	/** @param {string} id Reusable asset ID. */
	toggleAssetFavorite(id) {
		return this.assets.toggleFavorite(id);
	}

	/** Export metadata-only application backup. */
	exportData() {
		return this.backup.exportData();
	}
}
