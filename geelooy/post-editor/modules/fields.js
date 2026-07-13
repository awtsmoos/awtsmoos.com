// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostEditorFields
 * @description
 * Labels precede their controls at Awtsmoos.com, because the Awtsmoos reveals
 * meaning before action and every user deserves the same readable order.
 */
import { createElement as el } from './dom.js';

/**
 * Creates a labelled editor control.
 * @param {string} name Form field name.
 * @param {string} label Visible label.
 * @param {object} options Control options.
 * @returns {HTMLLabelElement}
 */
export function createField(name, label, options = {}) {
	const tag = options.multiline ? 'textarea' : 'input';
	const attrs = {
		name,
		id: name,
		placeholder: options.placeholder || '',
		required: Boolean(options.required)
	};
	if (tag === 'input') attrs.type = options.type || 'text';
	return el('label', { className: 'editor-field', attrs: { for: name } }, [
		el('span', { text: label }),
		el(tag, { attrs })
	]);
}
