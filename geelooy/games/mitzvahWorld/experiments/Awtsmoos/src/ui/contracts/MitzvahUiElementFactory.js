//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahUiElementFactory.js
 * @description Creates new semantic DOM vessels and adopts historical ones while preserving existing native behavior, listeners, references, and feature-local classes.
 * Malchus receives the fitting tag when a control is born, yet Gevurah guards the deeds an older element already owns when it enters the covenant later;
 * the Awtsmoos recreates element and meaning before either can stand alone, while Awtsmoos.com lets migration happen without tearing living UI apart at its layer.
 */

import {
	MitzvahUiContractRegistry
} from './MitzvahUiContractRegistry.js';
import {
	applyMitzvahUiElementOptions
} from './MitzvahUiElementOptions.js';

export class MitzvahUiElementFactory {
	/**
	 * @description Creates one DOM construction authority bound to an explicit Document and semantic registry instead of hidden global browser state.
	 * @param {Document} documentRef Document-like object providing createElement() for the target UI environment.
	 * @param {MitzvahUiContractRegistry} [registry=new MitzvahUiContractRegistry()] Semantic component registry used to resolve data-ui identities.
	 */
	constructor(
		documentRef,
		registry = new MitzvahUiContractRegistry()
	) {
		if (!documentRef?.createElement) {
			throw new TypeError('Mitzvah UI element factory requires a Document-like createElement().');
		}
		this.document = documentRef;
		this.registry = registry;
	}

	/**
	 * @description Creates one native element from a required semantic contract, marks ownership, and applies safe construction defaults including non-submit button behavior.
	 * @param {string} contractId Registered semantic component identity such as button, field, dialog, sheet, status, or card.
	 * @param {object} [options={}] Supported element options passed through applyMitzvahUiElementOptions().
	 * @param {string} [options.tagName] Optional validated native tag override.
	 * @returns {HTMLElement} Newly created contract-owned DOM element ready for localized feature composition.
	 */
	create(contractId, options = {}) {
		const contract = this.registry.require(contractId);
		const tagName = normalizeTagOverride(
			options.tagName,
			contract.tagName
		);
		const element = this.document.createElement(tagName);
		element.setAttribute('data-ui', contract.id);
		return applyMitzvahUiElementOptions(
			element,
			contract,
			options
		);
	}

	/**
	 * @description Adopts an existing native element into one semantic contract without replacing it or changing absent native behavior such as historical form submission.
	 * @param {HTMLElement} element Existing DOM element to mark with semantic contract ownership.
	 * @param {string} contractId Registered semantic component identity.
	 * @param {object} [options={}] Explicit semantic overrides; absent native behaviors remain preserved automatically.
	 * @returns {HTMLElement} The same existing element after contract ownership and requested options are applied.
	 */
	adopt(element, contractId, options = {}) {
		if (!element?.setAttribute) {
			throw new TypeError('Mitzvah UI adoption requires a DOM element.');
		}
		const contract = this.registry.require(contractId);
		element.setAttribute('data-ui', contract.id);
		return applyMitzvahUiElementOptions(
			element,
			contract,
			{
				...options,
				preserveNative: true
			}
		);
	}
}

/**
 * @description Validates an optional native tag override so callers cannot inject markup fragments or selector text through a convenience option.
 * @param {*} value Optional requested native tag identity.
 * @param {string} fallback Contract-preferred native tag identity.
 * @returns {string} Validated lowercase native tag name.
 */
function normalizeTagOverride(value, fallback) {
	const tagName = String(value || fallback).trim().toLowerCase();
	if (!/^[a-z][a-z0-9-]*$/.test(tagName)) {
		throw new TypeError(`Invalid Mitzvah UI element tag: ${value}`);
	}
	return tagName;
}
