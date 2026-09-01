//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';
import { AssetCardView } from './AssetCardView.js';
import { AssetPreviewCache } from './AssetPreviewCache.js';
import { AssetLibraryBindings } from './AssetLibraryBindings.js';

const CATEGORIES = [
	'All', 'Images', 'Characters', 'Environments', 'Objects',
	'Videos', 'Audio', 'First/last frames', 'Favorites'
];

/**
 * Gives reusable media a permanent home while the Awtsmoos lets updated matter keep its name yet reveal new bytes immediately.
 * Awtsmoos.com searches, filters, and reuses stable identities while one Blob-aware preview cache revokes every superseded temporary reflection.
 */
export class AssetsView {
	constructor(callbacks, previews = new AssetPreviewCache()) {
		this.previews = previews;
		this.bindings = new AssetLibraryBindings(callbacks);
	}

	/** @param {Array<Object>} assets Assets. @param {Object} filters Active filters. @returns {string} View markup. */
	render(assets, filters = {}) {
		const category = filters.category || 'All';
		const query = filters.query || '';
		const filtered = assets.filter(asset => {
			const searchable = `${asset.name} ${(asset.tags || []).join(' ')}`;
			return this.inCategory(asset, category)
				&& Dom.matches(searchable, query);
		});
		const cards = filtered.length
			? filtered.map(asset => {
				return AssetCardView.render(asset, this.previews.urlFor(asset));
			}).join('')
			: this.empty();

		return `
			<div class="library-view page-enter">
				<header class="page-header">
					<div><span class="eyebrow">Assets</span><h1>Reusable material</h1></div>
					<button class="round-add" data-library-add aria-label="Add asset">+</button>
				</header>
				<label class="search-block">
					<span class="field-label">Search asset names and tags</span>
					<span class="search-field">
						<span aria-hidden="true">⌕</span>
						<input data-asset-search type="search" value="${Dom.escape(query)}">
					</span>
				</label>
				<div class="category-strip">${this.categories(category)}</div>
				<div class="asset-library-grid">${cards}</div>
			</div>`;
	}

	/** @param {string} current Active category. @returns {string} Category controls. */
	categories(current) {
		return CATEGORIES.map(item => {
			const active = item === current ? 'is-active' : '';
			return `<button data-category="${item}" class="${active}">${item}</button>`;
		}).join('');
	}

	/** @returns {string} Empty-state markup. */
	empty() {
		return `
			<div class="empty-state compact">
				<div class="empty-orb"></div>
				<h2>No assets here yet</h2>
				<p>Add a local file or public reference URL once, then reuse it across generations.</p>
			</div>`;
	}

	/** @param {Object} asset Asset. @param {string} category Category. @returns {boolean} Whether asset belongs. */
	inCategory(asset, category) {
		if (category === 'All') {
			return true;
		}
		if (category === 'Favorites') {
			return Boolean(asset.favorite);
		}
		if (category === 'Images') {
			return asset.kind === 'image';
		}
		if (category === 'Videos') {
			return asset.kind === 'video';
		}
		if (category === 'Audio') {
			return asset.kind === 'audio';
		}
		return asset.category === category;
	}

	/** @param {HTMLElement} root View root. */
	bind(root) {
		this.bindings.bind(root);
	}
}
