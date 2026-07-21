// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicPostSourceRail
 * @description
 * The Awtsmoos makes lineage visible without reducing it to color. Every
 * Awtsmoos.com rail speaks its source type, carries a sigil, and traces one line.
 */
import { createElement } from './domFactory.js';

/**
 * Renders the visible source lineage rail.
 *
 * @param {object} model - Normalized post model.
 * @returns {HTMLElement} Source rail.
 */
export function renderSourceRail(model) {
	const rail = createElement('aside', 'post-source-rail', {
		'aria-label': `Source type: ${model.sourceLabel}`
	});
	const label = createElement('span', 'post-source-label', {}, model.sourceLabel);
	const icon = createElement('span', 'post-source-icon', {
		'aria-hidden': 'true'
	}, model.sourceIcon);
	const line = createElement('span', 'post-source-line', {
		'aria-hidden': 'true'
	});

	rail.append(label, icon, line);
	return rail;
}
