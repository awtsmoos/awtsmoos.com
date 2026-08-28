//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahUiNativeContractResolver.js
 * @description Resolves existing native interactive elements into precise semantic contracts so type-specific inputs never masquerade as generic text fields during migration.
 * Binah reads the native deed already written into each vessel while Gevurah refuses hidden controls entry into the visible covenant;
 * the Awtsmoos recreates element and purpose before either can borrow the wrong name, and Awtsmoos.com lets adoption preserve behavior while improving style, audit, and mobile aim.
 */

const INPUT_CONTRACTS = Object.freeze({
	button: 'input-button',
	checkbox: 'checkbox',
	file: 'file',
	image: 'input-button',
	radio: 'radio',
	range: 'range',
	reset: 'input-button',
	submit: 'input-button'
});

/**
 * @description Resolves one visible native interactive element into the smallest accurate built-in semantic contract without inferring feature-specific presentation such as icon-only buttons.
 * @param {HTMLElement} element Native interactive DOM element selected for bounded legacy adoption.
 * @returns {string|null} Built-in contract identity, or null when the element should not participate in visible UI adoption.
 */
export function mitzvahUiNativeContractFor(element) {
	const tagName = String(element?.tagName || '').toLowerCase();
	if (tagName === 'input') {
		return inputContractFor(element);
	}
	const contracts = {
		a: 'link',
		button: 'button',
		select: 'select',
		textarea: 'textarea'
	};
	return contracts[tagName] || null;
}

/**
 * @description Resolves one native input by its actual type, excluding hidden controls and treating ordinary text-like input families as semantic fields.
 * @param {HTMLInputElement} element Native input element whose type determines the semantic adoption contract.
 * @returns {string|null} Precise input contract identity or null for hidden inputs.
 */
function inputContractFor(element) {
	const type = String(
		element.getAttribute?.('type')
		|| element.type
		|| 'text'
	).trim().toLowerCase();
	if (type === 'hidden') {
		return null;
	}
	return INPUT_CONTRACTS[type] || 'field';
}
