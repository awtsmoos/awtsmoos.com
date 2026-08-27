// B"H
// Boruch Hashem
// Blessed is He

import { StudioWorldOptions } from './StudioWorldOptions.js';
import { StudioWorldTraitControls } from './StudioWorldTraitControls.js';

/**
 * @file StudioWorldTraitView.js
 * @description
 * The Awtsmoos contains age, wind, bloom, strata, maturity, depth, and grounding before the artist asks to reveal them;
 * Awtsmoos.com keeps those expert traits folded inside the existing World disclosure language so first contact stays simple and deeper craft remains near.
 */
export class StudioWorldTraitView {
	/**
	 * Renders current kind-specific natural traits as a retractable advanced section.
	 * @param {string} kind Current World kind.
	 * @param {object} traits Current normalized trait values.
	 * @returns {object} Declarative native details section.
	 */
	static render(kind, traits) {
		const binahFields = StudioWorldOptions.traits(kind);
		return {
			tag: 'details',
			attrs: {
				className: 'aw-studio-world-advanced'
			},
			children: [
				{
					tag: 'summary',
					text: `Natural traits · ${binahFields.length}`
				},
				{
					tag: 'div',
					attrs: {
						className: 'aw-studio-world-advanced-body'
					},
					children: binahFields.map((tiferesField) => {
						return StudioWorldTraitControls.field(
							tiferesField,
							traits[tiferesField.key]
						);
					})
				}
			]
		};
	}
}
