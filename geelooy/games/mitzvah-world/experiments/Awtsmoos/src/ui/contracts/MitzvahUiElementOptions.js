//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahUiElementOptions.js
 * @description Applies semantic identity, visible content, state, and layer intent while delegating native behavior and arbitrary attributes to the dedicated native-options vessel.
 * Binah gives each control its visible word and stable identity while Gevurah keeps browser deeds outside this quieter law;
 * the Awtsmoos recreates meaning and element before either can rule the other, and Awtsmoos.com lets contract application remain readable as old and new interfaces become one.
 */

import {
	assignMitzvahUiLayer
} from './MitzvahUiLayerPolicy.js';
import {
	applyMitzvahUiAttributes,
	applyMitzvahUiNativeInteraction
} from './MitzvahUiNativeOptions.js';

/**
 * @description Applies supported semantic options without copying arbitrary keys into DOM properties or changing preserved native behavior during historical adoption.
 * @param {HTMLElement} element Native DOM element already marked with a recognized data-ui component identity.
 * @param {Readonly<object>} contract Immutable semantic component contract resolved by the registry.
 * @param {object} [options={}] Supported identity, content, state, layer, native-interaction, and explicit-attribute options.
 * @returns {HTMLElement} The same element after all supported semantic options are applied.
 */
export function applyMitzvahUiElementOptions(
	element,
	contract,
	options = {}
) {
	applyIdentity(element, options);
	applyContent(element, options);
	applyMitzvahUiNativeInteraction(
		element,
		contract,
		options
	);
	applyMitzvahUiAttributes(
		element,
		options.attributes
	);
	if (options.layer) {
		assignMitzvahUiLayer(element, options.layer);
	}
	return element;
}

/**
 * @description Applies stable DOM identity and semantic state markers without generating IDs implicitly or conflating feature classes with component contracts.
 * @param {HTMLElement} element Target contract-owned DOM element.
 * @param {object} options Element construction or adoption options.
 * @returns {void}
 */
function applyIdentity(element, options) {
	if (options.id) {
		element.id = String(options.id);
	}
	if (options.state) {
		element.setAttribute(
			'data-ui-state',
			String(options.state)
		);
	}
}

/**
 * @description Applies visible text, explicit accessible label, and form value while keeping each channel distinct so field values are never mistaken for labeling.
 * @param {HTMLElement} element Target contract-owned DOM element.
 * @param {object} options Element construction or adoption options.
 * @returns {void}
 */
function applyContent(element, options) {
	if (options.text !== undefined) {
		element.textContent = String(options.text);
	}
	if (options.label) {
		element.setAttribute(
			'aria-label',
			String(options.label)
		);
	}
	if (options.value !== undefined && 'value' in element) {
		element.value = String(options.value);
	}
}
