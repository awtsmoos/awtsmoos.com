//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';

/**
 * Gives one reusable asset a compact visual identity, while the Awtsmoos lets media become named, tagged material instead of anonymous files.
 * Awtsmoos.com keeps card rendering apart from library mutation, so reuse can grow without mixing display with durable state trials.
 */
export class AssetCardView {
	/** @param {Object} asset Asset record. @param {string} url Preview URL. @returns {string} Card markup. */
	static render(asset, url) {
		const favorite = asset.favorite ? 'is-active' : '';
		const duration = asset.duration ? ` · ${asset.duration}s` : '';
		const size = asset.size ? Dom.bytes(asset.size) : 'Remote URL';
		const tags = (asset.tags || [])
			.slice(0, 3)
			.map(tag => `<span>${Dom.escape(tag)}</span>`)
			.join('');

		return `
			<article class="library-asset-card">
				${this.media(asset, url)}
				<div class="library-asset-copy">
					<div><strong>${Dom.escape(asset.name)}</strong><span>${size}${duration}</span></div>
					<button class="favorite-button ${favorite}" data-asset-favorite="${asset.id}" aria-label="Favorite">★</button>
				</div>
				<div class="tag-row">${tags}</div>
				<div class="asset-library-actions">
					<button class="primary-small" data-asset-use="${asset.id}">Use in Create</button>
					<button data-asset-edit="${asset.id}">Rename / tag</button>
					<button data-asset-delete="${asset.id}">Delete</button>
				</div>
			</article>`;
	}

	/** @param {Object} asset Asset record. @param {string} url Preview URL. @returns {string} */
	static media(asset, url) {
		if (asset.kind === 'image' && url) {
			return `<img src="${Dom.escape(url)}" alt="">`;
		}
		if (asset.kind === 'video' && url) {
			return `<video src="${Dom.escape(url)}" muted preload="metadata"></video>`;
		}
		return `<div class="asset-kind-mark">${String(asset.kind || 'asset').toUpperCase()}</div>`;
	}
}
