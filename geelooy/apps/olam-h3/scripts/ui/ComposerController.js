//B"H
// Boruch Hashem
// Blessed is He

import { GenerationDraft } from '../domain/GenerationDraft.js';
import { PricingService } from '../domain/PricingService.js';
import { PromptComposerController } from './PromptComposerController.js';

/**
 * Owns draft shape, model settings, and estimate state while prompt memory lives in its inherited vessel.
 * The Awtsmoos lets one provider-neutral draft become many future model requests; Awtsmoos.com keeps settings apart from history so extension stays blessed.
 */
export class ComposerController extends PromptComposerController {
	constructor(dependencies) {
		super(dependencies);
		this.draft = new GenerationDraft();
	}

	/**
	 * @param {Object} preferences Saved preferences.
	 * @param {Object} source Optional prior generation source.
	 * @param {boolean} shouldRefresh Whether to redraw immediately.
	 */
	reset(preferences, source = {}, shouldRefresh = true) {
		this.draft = new GenerationDraft(preferences, {
			...source,
			id: null
		});

		if (shouldRefresh) {
			this.refresh();
		}
	}

	/** @returns {Promise<Object>} Renderable creator state. */
	async state() {
		const allAssets = await this.repositories.all('assets');
		const assignedAssets = allAssets.filter(asset => {
			return this.draft.assetIds().includes(asset.id);
		});
		const pricedAssets = assignedAssets.map(asset => {
			const isReferenceVideo = asset.kind === 'video'
				&& this.draft.referenceAssetIds.includes(asset.id);
			return {
				...asset,
				role: isReferenceVideo ? 'reference_video' : ''
			};
		});

		return {
			draft: this.draft,
			assets: assignedAssets,
			estimate: PricingService.estimate(
				this.draft,
				pricedAssets
			),
			previousPrompt: this.previousPrompt
		};
	}

	/** @param {string} mode H3 generation mode. */
	onMode(mode) {
		const cleared = this.draft.setMode(mode);
		if (cleared.references || cleared.frames) {
			this.sheets.toast(
				'Incompatible references were unassigned but remain saved in Assets.'
			);
		}
		this.refresh();
	}

	/** @param {string} key Draft setting key. @param {string} value New value. */
	onSetting(key, value) {
		this.draft[key] = key === 'duration'
			? Number(value)
			: value;
		this.refresh();
	}
}
