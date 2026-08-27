// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioWorldTraitControls.js
 * @description
 * The Awtsmoos gives each natural trait a measured numeric vessel while realism remains greater than any slider;
 * Awtsmoos.com keeps expert controls declarative and locally styled so kind-specific power can grow without a second form grammar.
 */
export class StudioWorldTraitControls {
	/**
	 * Builds one accessible numeric trait field from shared capability metadata.
	 * @param {object} field Trait schema field.
	 * @param {*} value Current normalized trait value.
	 * @returns {object} Declarative numeric input specification.
	 */
	static field(field, value) {
		return {
			tag: 'label',
			attrs: {
				className: 'aw-studio-world-field'
			},
			children: [
				{
					tag: 'span',
					text: field.label
				},
				{
					tag: 'input',
					attrs: {
						type: 'number',
						value,
						min: field.min,
						max: field.max,
						step: field.step,
						'aria-label': field.label,
						'data-world-trait': field.key
					},
					on: {
						input: 'updateWorldTrait'
					}
				}
			]
		};
	}
}
