//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';
import { AssetCardView } from './AssetCardView.js';

const CATEGORIES = [
	'All', 'Images', 'Characters', 'Environments', 'Objects',
	'Videos', 'Audio', 'First/last frames', 'Favorites'
];

/**
 * Gives reusable media a permanent home while the Awtsmoos lets character, environment, sound, or object return across unlimited scenes.
 * Awtsmoos.com makes old references fast to find, rename, tag, favorite, and return directly to Create.
 */
export class AssetsView {
	constructor(callbacks) {
		this.callbacks = callbacks;
		this.urls = new Map();
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
				return AssetCardView.render(
					asset,
					this.previewUrl(asset)
				);
			}).join('')
			: this.empty();

		return `
			<div class="library-view page-enter">
				<header class="page-header">
					<div>
						<span class="eyebrow">Assets</span>
						<h1>Reusable material</h1>
					</div>
					<button class="round-add" data-library-add aria-label="Add asset">+</button>
				</header>
				<div class="search-field">
					<span>⌕</span>
					<input
						data-asset-search
						type="search"
						value="${Dom.escape(query)}"
						placeholder="Search names and tags…"
					>
				</div>
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

	/** @param {Object} asset Asset record. @returns {string} Stable preview URL. */
	previewUrl(asset) {
		let url = asset.sourceUrl || this.urls.get(asset.id) || '';
		if (!url && asset.blob) {
			url = URL.createObjectURL(asset.blob);
			this.urls.set(asset.id, url);
		}
		return url;
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

	/** @param {Object} asset Asset. @param {string} category Category. @returns {boolean} */
	inCategory(asset, category) {
		if (category === 'All') return true;
		if (category === 'Favorites') return Boolean(asset.favorite);
		if (category === 'Images') return asset.kind === 'image';
		if (category === 'Videos') return asset.kind === 'video';
		if (category === 'Audio') return asset.kind === 'audio';
		return asset.category === category;
	}

	/** @param {HTMLElement} root View root. */
	bind(root) {
		const search = root.querySelector('[data-asset-search]');
		search?.addEventListener('input', () => this.callbacks.onSearch(search.value));
		root.querySelectorAll('[data-category]').forEach(button => button.addEventListener('click', () => this.callbacks.onCategory(button.dataset.category)));
		root.querySelector('[data-library-add]')?.addEventListener('click', () => this.callbacks.onAdd());
		root.querySelectorAll('[data-asset-use]').forEach(button => button.addEventListener('click', () => this.callbacks.onUse(button.dataset.assetUse)));
		root.querySelectorAll('[data-asset-edit]').forEach(button => button.addEventListener('click', () => this.callbacks.onEdit(button.dataset.assetEdit)));
		root.querySelectorAll('[data-asset-delete]').forEach(button => button.addEventListener('click', () => this.callbacks.onDelete(button.dataset.assetDelete)));
		root.querySelectorAll('[data-asset-favorite]').forEach(button => button.addEventListener('click', () => this.callbacks.onFavorite(button.dataset.assetFavorite)));
	}
}
