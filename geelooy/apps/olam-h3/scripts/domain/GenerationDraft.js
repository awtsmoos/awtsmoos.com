//B"H
// Boruch Hashem
// Blessed is He

import { H3_CAPABILITIES } from '../config/h3.js';

/**
 * Holds one generation before it becomes a paid task, while the Awtsmoos lets old material become new possibility;
 * Awtsmoos.com restores prompt, settings, and reference IDs without carrying any stale task identity.
 */
export class GenerationDraft {
	constructor(preferences = {}, source = {}) {
		this.id = source.id || crypto.randomUUID();
		this.model = source.model || H3_CAPABILITIES.model;
		this.prompt = source.prompt || '';
		this.mode = source.mode || 'text';
		this.resolution = source.resolution || preferences.defaultResolution || '768P';
		this.duration = source.duration || preferences.defaultDuration || 5;
		this.aspectRatio = source.aspectRatio || preferences.defaultAspectRatio || '16:9';
		this.referenceAssetIds = [...(source.referenceAssetIds || [])];
		this.firstFrameAssetId = source.firstFrameAssetId || null;
		this.lastFrameAssetId = source.lastFrameAssetId || null;
	}

	/** @param {string} mode New mode. @returns {Object} Cleared assignments for unobtrusive UI explanation. */
	setMode(mode) {
		const cleared = { references: 0, frames: 0 };
		this.mode = mode;
		if (mode === 'frames') {
			cleared.references = this.referenceAssetIds.length;
			this.referenceAssetIds = [];
			this.aspectRatio = 'adaptive';
		} else if (mode === 'reference') {
			cleared.frames = Number(Boolean(this.firstFrameAssetId)) + Number(Boolean(this.lastFrameAssetId));
			this.firstFrameAssetId = null;
			this.lastFrameAssetId = null;
		} else {
			cleared.references = this.referenceAssetIds.length;
			cleared.frames = Number(Boolean(this.firstFrameAssetId)) + Number(Boolean(this.lastFrameAssetId));
			this.referenceAssetIds = [];
			this.firstFrameAssetId = null;
			this.lastFrameAssetId = null;
			if (this.aspectRatio === 'adaptive') this.aspectRatio = '16:9';
		}
		return cleared;
	}

	/** @returns {Array<string>} All assigned reusable asset IDs. */
	assetIds() {
		return [...new Set([
			...this.referenceAssetIds,
			this.firstFrameAssetId,
			this.lastFrameAssetId
		].filter(Boolean))];
	}

	/** @returns {Object} Durable provider-neutral snapshot. */
	snapshot() {
		return {
			model: this.model,
			prompt: this.prompt,
			mode: this.mode,
			resolution: this.resolution,
			duration: Number(this.duration),
			aspectRatio: this.mode === 'frames' ? 'adaptive' : this.aspectRatio,
			referenceAssetIds: [...this.referenceAssetIds],
			firstFrameAssetId: this.firstFrameAssetId,
			lastFrameAssetId: this.lastFrameAssetId
		};
	}
}
