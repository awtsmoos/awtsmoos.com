//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahUiFormContracts.js
 * @description Declares native interactive form/control contracts separately from larger UI surfaces so checkbox, radio, range, file, button-like input, and text-field semantics never collapse into one misleading shape.
 * Binah names each vessel by the deed it performs while Gevurah keeps hidden input outside the visible covenant;
 * the Awtsmoos recreates hand and control before either can borrow the wrong garment, and Awtsmoos.com lets mobile, CSS, audit, and accessibility drink from one precise spring.
 */

import {
	createMitzvahUiComponentContract
} from './MitzvahUiComponentContract.js';

/**
 * @description Creates the complete immutable native-control contract set used by factories and legacy adoption without including container, modal, status, or layout surfaces.
 * @returns {ReadonlyArray<Readonly<object>>} Frozen ordered native form/control contract collection.
 */
export function mitzvahUiFormContracts() {
	return Object.freeze([
		control('button', 'button', ['hover', 'active', 'loading', 'selected'], true),
		control('icon-button', 'button', ['hover', 'active', 'loading', 'selected'], true),
		control('input-button', 'input', ['hover', 'active', 'loading'], true),
		control('field', 'input', ['hover', 'error', 'success'], true),
		control('checkbox', 'input', ['hover', 'selected'], false),
		control('radio', 'input', ['hover', 'selected'], false),
		control('range', 'input', ['hover'], true),
		control('file', 'input', ['hover', 'error', 'success'], true),
		control('select', 'select', ['hover', 'error', 'success'], true),
		control('textarea', 'textarea', ['hover', 'error', 'success'], false),
		control('link', 'a', ['hover', 'active'], true)
	]);
}

/**
 * @description Creates one interactive native-control contract with consistent accessible-name requirements and caller-selected touch policy.
 * @param {string} id Stable semantic component identity installed through data-ui.
 * @param {string} tagName Preferred native HTML tag used for newly created instances.
 * @param {string[]} states Additional interaction states beyond the shared default/focus-visible/disabled vocabulary.
 * @param {boolean} touchTarget Whether the element's own rendered box should satisfy the shared mobile touch minimum.
 * @returns {Readonly<object>} Immutable normalized native-control contract.
 */
function control(id, tagName, states, touchTarget) {
	return createMitzvahUiComponentContract({
		id,
		interactive: true,
		requiresLabel: true,
		states,
		tagName,
		touchTarget
	});
}
