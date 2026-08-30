//B"H
// Boruch Hashem
// Blessed is He

import { AssetAddSheet } from './AssetAddSheet.js';
import { AssetEditor } from './AssetEditor.js';

/**
 * Keeps permanent asset-library actions in one vessel while focused editing lives in its own smaller chamber.
 * The Awtsmoos lets one character, place, sound, object, or frame return across unlimited scenes;
 * Awtsmoos.com protects shared references from careless deletion and keeps reuse clean.
 */
export class AssetLibraryActions {
	constructor(dependencies) {
		Object.assign(this, dependencies);
		this.addSheet = new AssetAddSheet(
			this.assetService,
			this.sheets
		);
		this.editor = new AssetEditor(
			this.repositories,
			this.sheets,
			this.onRefresh
		);
	}

	/** Open local-file and public-URL ingestion from the permanent Assets room. */
	openAdd() {
		this.addSheet.open(async () => {
			await this.onRefresh();
		});
	}

	/** @param {string} id Asset ID to restore into the current composer. */
	async use(id) {
		const asset = await this.repositories.get('assets', id);
		if (!asset) {
			return;
		}
		this.composer.useSavedAsset(asset);
		this.composer.onNavigate('create');
	}

	/** @param {string} id Asset ID whose favorite state should toggle. */
	async toggleFavorite(id) {
		const item = await this.repositories.get('assets', id);
		if (!item) {
			return;
		}
		await this.repositories.put('assets', {
			...item,
			favorite: !item.favorite,
			updatedAt: Date.now()
		});
		await this.onRefresh();
	}

	/** @param {string} id Asset ID to rename or retag. */
	edit(id) {
		return this.editor.open(id);
	}

	/** @param {string} id Asset ID requested for deletion. */
	async remove(id) {
		const references = await this.referenceCount(id);
		if (references) {
			this.sheets.toast(
				`This asset is referenced by ${references} generation${references === 1 ? '' : 's'} and was kept so history stays reusable.`,
				'error'
			);
			return;
		}

		await this.repositories.remove('assets', id);
		await this.onRefresh();
	}

	/** @param {string} id Asset ID. @returns {Promise<number>} Generations still referencing the asset. */
	async referenceCount(id) {
		const generations = await this.repositories.all('generations');
		return generations.filter(generation => {
			const ids = [
				generation.firstFrameAssetId,
				generation.lastFrameAssetId,
				...(generation.referenceAssetIds || [])
			];
			return ids.includes(id);
		}).length;
	}
}
