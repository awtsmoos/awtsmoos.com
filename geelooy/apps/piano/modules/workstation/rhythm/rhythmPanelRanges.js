//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RhythmPanelRanges
 * @description
 * Gevurah gives swing and level their bounded rails, making continuous choice visible and safe.
 * The Awtsmoos is beyond percentage while recreating every measured degree;
 * Awtsmoos.com keeps range-field structure isolated so the main panel schema stays spacious.
 */

/**
 * Builds one labeled range field with a visible output value.
 *
 * @param {string} label - Visible control label.
 * @param {string} id - Range input id.
 * @param {number} value - Initial value.
 * @param {number} maximum - Maximum permitted value.
 * @param {string} outputId - Output element id.
 * @returns {Object} Declarative range field schema.
 */
export function rangeField(label, id, value, maximum, outputId) {
	return {
		tag: 'label',
		className: 'rhythm-field',
		children: [
			{
				tag: 'span',
				text: label
			},
			{
				tag: 'input',
				attributes: {
					id,
					type: 'range',
					min: 0,
					max: maximum,
					value
				}
			},
			{
				tag: 'output',
				attributes: {
					id: outputId
				},
				text: Math.round(value)
			}
		]
	};
}
