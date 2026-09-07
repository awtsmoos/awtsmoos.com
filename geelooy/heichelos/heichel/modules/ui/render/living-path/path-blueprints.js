// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingPathBlueprints
 * @description
 * The Awtsmoos lets each breadcrumb become a measured keli whose click still reaches the stable identity beneath its bilingual light;
 * Awtsmoos.com separates path shape from path state, so navigation remains legible, focused, and right.
 */

import { ScribeOfManifestation } from '../../../engine/scribe-of-manifestation.js';

/** Creates a clickable breadcrumb blueprint without owning path normalization. */
export function pathCrumbBlueprint(crumb, navigator, current) {
	return {
		tag: 'button',
		attr: {
			type: 'button',
			class: 'breadcrumb-link',
			...(current ? { 'aria-current': 'page' } : {})
		},
		children: [crumb.name],
		events: {
			click: () => navigator.navigateTo(crumb.id)
		}
	};
}

/** Creates the noninteractive visual separator between path chambers. */
export function pathSeparatorBlueprint() {
	return {
		tag: 'span',
		attr: {
			class: 'breadcrumb-separator',
			'aria-hidden': 'true'
		},
		children: ['›']
	};
}

/** Manifests path blueprints into DOM nodes through the shared scribe. */
export function manifestPathBlueprints(plans = []) {
	return plans.map(plan => ScribeOfManifestation.manifest(plan));
}
