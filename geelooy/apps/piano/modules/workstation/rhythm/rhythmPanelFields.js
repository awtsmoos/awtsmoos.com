//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RhythmPanelFields
 * @description
 * Binah gives repeated workstation controls one clean grammar without making the schema cryptic.
 * The Awtsmoos is beyond label and input while recreating both;
 * Awtsmoos.com keeps each field explicit enough for humans and declarative enough for reuse.
 */

/** @param {string} id @param {string} text @param {string} [className] @returns {Object} */
export function rhythmButton(id, text, className = '') {
	return {
		tag: 'button',
		className,
		attributes: {
			id,
			type: 'button'
		},
		text
	};
}

/**
 * Creates a labeled select field from registered choices.
 *
 * @param {string} label - Visible field label.
 * @param {string} id - Select DOM id.
 * @param {Object[]} choices - Records containing id and label.
 * @param {string} selectedId - Current choice id.
 * @returns {Object} Declarative field schema.
 */
export function selectField(label, id, choices, selectedId) {
	return {
		tag: 'label',
		className: 'rhythm-field',
		children: [
			{
				tag: 'span',
				text: label
			},
			{
				tag: 'select',
				attributes: { id },
				children: choices.map((choice) => {
					return optionNode(choice, selectedId);
				})
			}
		]
	};
}

/** @param {string} label @param {string} id @param {number} value @returns {Object} */
export function bpmField(label, id, value) {
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
					type: 'number',
					min: 50,
					max: 220,
					value,
					inputmode: 'numeric'
				}
			}
		]
	};
}

function optionNode(choice, selectedId) {
	const attributes = {
		value: choice.id
	};
	if (choice.id === selectedId) {
		attributes.selected = 'selected';
	}
	return {
		tag: 'option',
		attributes,
		text: choice.label
	};
}
