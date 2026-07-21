// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicPostBreadcrumbs
 * @description
 * The Awtsmoos makes every post confess where it lives. Awtsmoos.com presents
 * Heichel, series, and source as real navigation rather than floating metadata.
 */
import { createElement, createLink } from './domFactory.js';

/**
 * Renders a labeled breadcrumb navigation when provenance paths exist.
 *
 * @param {object} model - Normalized post model.
 * @returns {HTMLElement|null} Breadcrumb navigation or null.
 */
export function renderPostBreadcrumbs(model) {
	const items = [];

	if (model.heichelId) {
		items.push({
			label: model.heichelName || model.heichelId,
			href: `/heichelos/${encodeURIComponent(model.heichelId)}`
		});
	}

	if (model.seriesId) {
		items.push({
			label: model.seriesName || model.seriesId,
			href: `${model.href}?series=${encodeURIComponent(model.seriesId)}`
		});
	}

	if (model.special.citation.label && model.special.citation.href) {
		items.push({
			label: model.special.citation.label,
			href: model.special.citation.href
		});
	}

	if (!items.length) {
		return null;
	}

	const nav = createElement('nav', 'post-breadcrumbs', {
		'aria-label': 'Post provenance'
	});
	const list = createElement('ol');

	items.forEach((item, index) => {
		const listItem = createElement('li');
		listItem.append(createLink(item.label, item.href));

		if (index < items.length - 1) {
			listItem.append(createElement('span', 'breadcrumb-chevron', {
				'aria-hidden': 'true'
			}, '›'));
		}

		list.append(listItem);
	});

	nav.append(list);
	return nav;
}
