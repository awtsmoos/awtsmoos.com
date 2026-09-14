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
		heading.append(title, count);
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
