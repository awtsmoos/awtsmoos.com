// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchGroupingView
 * @description
 * Renders a compact relevance/category switch and category chambers while the
 * same bounded search response remains authoritative underneath both views.
 */

import {
	groupedHits,
	rememberPresentationMode,
	selectedPresentationMode,
	supportedPresentationModes
} from './searchGroupingModel.js';

/** Creates one accessible toggle only when category presentation is supported. */
export function presentationSwitch(search, mode, onChange) {
	const modes = supportedPresentationModes(search);
	if (!modes.includes('category')) return null;
	const nav = document.createElement('div');
	nav.className = 'library-result-mode';
	nav.setAttribute('role', 'group');
	nav.setAttribute('aria-label', 'Search result organization');
	for (const value of modes) {
		const button = document.createElement('button');
		button.type = 'button';
		button.className = 'library-result-mode-button';
		button.textContent = value === 'category' ? 'Categories' : 'Relevance';
		button.setAttribute('aria-pressed', String(mode === value));
		button.addEventListener('click', () => {
			if (mode === value) return;
			rememberPresentationMode(value);
			onChange(value);
		});
		nav.append(button);
	}
	return nav;
}

/** Golden result-type icons keyed by backend category id (B"H 2026-10-13, icon round 2). */
const CATEGORY_GICONS = Object.freeze({
	sources: { cls: 'gicon--book', url: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-book.webp?v=89fce054b2' },
	heichelos: { cls: 'gicon--torah', url: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/media-generation-icon-torah-active-0-7cccc6e3-c14e-4edd-a9e4-e0dc2c164897.webp' },
	posts: { cls: 'gicon--edit', url: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-edit.webp?v=4a58469fca' },
	aliases: { cls: 'gicon--users', url: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-users.webp?v=a99ebb2312' },
	series: { cls: 'gicon--layers', url: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/gicon-layers.webp?v=0aeef9a4c9' }
});
const FALLBACK_GICON = Object.freeze({
	cls: 'gicon--search',
	url: 'https://awtsmoos.com/api/social/drive/public/awtsmoos/icons/media-generation-icon-search-0-2d839271-ea0a-46bb-a647-16fc27971baa.webp'
});

/** Builds one decorative result-type icon for a category heading. */
function categoryGicon(documentValue, categoryId) {
	const vessel = CATEGORY_GICONS[String(categoryId || '').toLowerCase()] || FALLBACK_GICON;
	const img = documentValue.createElement('img');
	img.className = `gicon gicon--xs ${vessel.cls}`;
	img.src = vessel.url;
	img.alt = '';
	img.setAttribute('aria-hidden', 'true');
	img.loading = 'lazy';
	img.decoding = 'async';
	img.width = 18;
	img.height = 18;
	return img;
}

/** Renders category sections with backend relevance ordering preserved inside. */
export function renderCategoryGroups(container, search, hits, cardFactory) {
	const groups = groupedHits(search, hits);
	const fragment = document.createDocumentFragment();
	groups.forEach((group, groupIndex) => {
		const section = document.createElement('section');
		section.className = 'library-result-group';
		section.dataset.category = group.category.id;
		const heading = document.createElement('header');
		heading.className = 'library-result-group-heading';
		const title = document.createElement('h3');
		title.textContent = group.category.title;
		const count = document.createElement('span');
		count.textContent = `${group.hits.length}`;
		count.setAttribute('aria-label', `${group.hits.length} results`);
		heading.append(categoryGicon(container.ownerDocument, group.category.id), title, count);
		section.append(heading);
		const firstCommentIndex = group.hits.findIndex(hit => {
			return Array.isArray(hit?.comments) && hit.comments.length > 0;
		});
		group.hits.forEach((hit, hitIndex) => {
			section.append(cardFactory(
				hit,
				hitIndex,
				groupIndex === 0 && hitIndex === firstCommentIndex
			));
		});
		fragment.append(section);
	});
	container.replaceChildren(fragment);
}

/** Renders one complete response surface and switches presentation without refetch. */
export function renderSearchPresentation({ container, search, hits, renderRelevance, cardFactory, emptyCard }) {
	const paint = mode => {
		const surface = document.createElement('div');
		surface.className = 'library-result-surface';
		const controls = presentationSwitch(search, mode, paint);
		container.replaceChildren(...(controls ? [controls, surface] : [surface]));
		if (!hits.length) {
			surface.append(emptyCard());
			return;
		}
		if (mode === 'category') {
			renderCategoryGroups(surface, search, hits, cardFactory);
			return;
		}
		renderRelevance(surface);
	};
	paint(selectedPresentationMode(search));
}
