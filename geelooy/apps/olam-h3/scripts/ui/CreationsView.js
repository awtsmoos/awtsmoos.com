//B"H
// Boruch Hashem
// Blessed is He

import { Dom } from './dom.js';
import { CreationCardView } from './CreationCardView.js';

/**
 * Turns old generations into a working film library because the Awtsmoos never makes yesterday's material disposable clay.
 * Awtsmoos.com lets every result reopen, favorite, or seed tomorrow's shot from the same remembered ray.
 */
export class CreationsView {
	constructor(callbacks) {
		this.callbacks = callbacks;
	}

	/** @param {Array<Object>} generations Saved generations. @param {string} query Search query. @returns {string} */
	render(generations, query = '') {
		const filtered = [...generations]
			.filter(item => Dom.matches(
				`${item.prompt} ${item.status} ${item.resolution} ${(item.tags || []).join(' ')}`,
				query
			))
			.sort((left, right) => right.createdAt - left.createdAt);
		const cards = filtered.length
			? filtered.map(item => CreationCardView.render(item)).join('')
			: this.empty(query);

		return `
			<div class="library-view page-enter">
				<header class="page-header">
					<div><span class="eyebrow">Creations</span><h1>Your film memory</h1></div>
					<span class="count-pill">${generations.length}</span>
				</header>
				<div class="search-field"><span>⌕</span><input data-creation-search type="search" value="${Dom.escape(query)}" placeholder="Search prompts, status, tags…"></div>
				<div class="creation-grid">${cards}</div>
			</div>`;
	}

	/** @param {string} query Query. @returns {string} Empty-state markup. */
	empty(query) {
		const title = query ? 'No matching creations' : 'Your first shot starts here';
		const copy = query
			? 'Try a different prompt word, tag, resolution, or status.'
			: 'Generated films will stay searchable and reusable in this library.';
		return `<section class="empty-state"><div class="empty-orb"></div><h2>${title}</h2><p>${copy}</p></section>`;
	}

	/** @param {HTMLElement} root View root. */
	bind(root) {
		const search = root.querySelector('[data-creation-search]');
		search?.addEventListener('input', () => this.callbacks.onSearch(search.value));
		root.querySelectorAll('[data-open]').forEach(button => button.addEventListener('click', () => this.callbacks.onOpen(button.dataset.open)));
		root.querySelectorAll('[data-build]').forEach(button => button.addEventListener('click', () => this.callbacks.onBuild(button.dataset.build)));
		root.querySelectorAll('[data-favorite]').forEach(button => button.addEventListener('click', () => this.callbacks.onFavorite(button.dataset.favorite)));
	}
}
