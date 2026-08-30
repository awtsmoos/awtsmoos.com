//B"H
// Boruch Hashem
// Blessed is He

import { ComposerAssetsController } from './ComposerAssetsController.js';
import { AssetAddSheet } from './AssetAddSheet.js';
import { Dom } from './dom.js';

/**
 * Owns reusable reference selection while the Awtsmoos lets one saved image, sound, or motion become fresh creative material without duplication;
 * Awtsmoos.com keeps library picking and frame placement apart from pricing and submission, so each path remains clear in revelation.
 */
export class ComposerReferenceActions extends ComposerAssetsController {
	constructor(dependencies) {
		super(dependencies);
		this.assetAddSheet = new AssetAddSheet(
			this.assetService,
			this.sheets
		);
	}

	/** Open the reusable local asset picker. */
	async openLibrary() {
		const assets = (await this.repositories.all('assets'))
			.sort((left, right) => right.updatedAt - left.updatedAt);
		const cards = assets.map(asset => `
			<article>
				<div>
					<strong>${Dom.escape(asset.name)}</strong>
					<span>${asset.kind} · ${Dom.bytes(asset.size)}</span>
				</div>
				<button data-pick-asset="${asset.id}">Use</button>
			</article>`).join('');
		const body = `
			<div class="sheet-list asset-picker">
				${cards || '<p>No saved assets yet.</p>'}
			</div>`;

		this.sheets.open('Choose reusable asset', body, root => {
			root.querySelectorAll('[data-pick-asset]').forEach(button => {
				button.addEventListener('click', () => {
					const asset = assets.find(item => {
						return item.id === button.dataset.pickAsset;
					});
					this.useSavedAsset(asset);
				});
			});
		});
	}

	/** @param {Object} asset Saved reusable asset. */
	useSavedAsset(asset) {
		if (!asset) {
			return;
		}
		if (this.draft.mode === 'text') {
			this.draft.setMode('reference');
		}
		if (this.draft.mode === 'frames') {
			this.assignFrameAsset(asset);
		} else {
			this.assign(asset.id, 'reference');
		}
		this.sheets.close();
		this.refresh();
	}

	/** @param {Object} asset Image asset for first/last frame placement. */
	assignFrameAsset(asset) {
		if (asset.kind !== 'image') {
			this.sheets.toast(
				'First/last frame mode accepts images only.',
				'error'
			);
			return;
		}
		if (!this.draft.firstFrameAssetId) {
			this.draft.firstFrameAssetId = asset.id;
		} else {
			this.draft.lastFrameAssetId = asset.id;
		}
	}

	/** Open reusable asset ingestion and use the saved result immediately. */
	openUrl() {
		this.assetAddSheet.open(async asset => {
			this.useSavedAsset(asset);
		}, 'Images');
	}
}
