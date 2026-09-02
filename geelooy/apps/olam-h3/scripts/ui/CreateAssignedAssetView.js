//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';
import { AssetPreviewCache } from './AssetPreviewCache.js';

/**
 * Gives each assigned reference a visible role while the Awtsmoos lets replaced matter keep one identity and reveal its newest face.
 * Awtsmoos.com separates preview custody from card markup so replacement revokes stale URLs and every reference can refresh without memory waste.
 */
export class CreateAssignedAssetView {
	constructor(previews = new AssetPreviewCache()) {
		this.previews = previews;
	}

	/** @param {Object} item Role-aware asset. @returns {string} Assigned media card markup. */
	render(item) {
		const asset = item.asset;
		const draggable = item.role.startsWith('reference_');

		return `
			<article class="asset-card" draggable="${draggable}" data-asset-id="${asset.id}">
				${this.preview(asset)}
				<div class="asset-card-copy">
					<strong>${Dom.escape(asset.name)}</strong>
					<span>${Dom.escape(item.role.replaceAll('_', ' '))} · ${Dom.bytes(asset.size)}</span>
				</div>
				<div class="asset-card-actions">
					<button data-move-asset="${asset.id}" data-delta="-1" aria-label="Move earlier">↑</button>
					<button data-move-asset="${asset.id}" data-delta="1" aria-label="Move later">↓</button>
					<button data-replace="${asset.id}" data-role="${item.role}">Replace</button>
					<button data-remove-asset="${asset.id}" data-role="${item.role}">Remove</button>
				</div>
			</article>`;
	}

	/** @param {Object} asset Asset record. @returns {string} Image/video/audio preview. */
	preview(asset) {
		const url = this.previews.urlFor(asset);
		if (asset.kind === 'image' && url) {
			return `<img class="asset-preview" src="${Dom.escape(url)}" alt="">`;
		}
		if (asset.kind === 'video' && url) {
			return `<video class="asset-preview" src="${Dom.escape(url)}" muted preload="metadata"></video>`;
		}
		return '<div class="asset-preview asset-audio">AUDIO</div>';
	}
}
