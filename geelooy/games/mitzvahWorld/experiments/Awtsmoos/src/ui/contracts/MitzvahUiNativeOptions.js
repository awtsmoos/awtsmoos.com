//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahUiNativeOptions.js
 * @description Owns native interaction and explicit attribute application so semantic element options can remain focused on identity, visible content, state, and layer intent.
 * Gevurah guards submit, disabled, link, role, and modal behavior while Binah admits only explicit safe attributes through the gate;
 * the Awtsmoos recreates native deed and semantic meaning before either can override the other, and Awtsmoos.com lets adoption preserve history while new controls still begin in a safe state.
 */

/**
 * @description Applies native interactive behavior only when construction policy authorizes it, preserving historical submit/link semantics during adoption unless explicitly overridden.
 * @param {HTMLElement} element Target contract-owned DOM element.
 * @param {Readonly<object>} contract Resolved immutable semantic component contract.
 * @param {object} options Construction/adoption options including preserveNative, type, disabled, and href.
 * @returns {void}
 */
export function applyMitzvahUiNativeInteraction(
	element,
	contract,
	options
) {
	const tagName = element.tagName?.toLowerCase();
	if (contract.tagName === 'button' && tagName === 'button') {
		applyButtonType(element, options);
	}
	if (options.disabled !== undefined && 'disabled' in element) {
		element.disabled = Boolean(options.disabled);
	}
	if (options.href && tagName === 'a') {
		element.setAttribute('href', String(options.href));
	}
	if (contract.role) {
		element.setAttribute('role', contract.role);
	}
	if (contract.id === 'dialog' || contract.id === 'sheet') {
		element.setAttribute('aria-modal', 'true');
	}
}

/**
 * @description Applies an explicit caller-provided attribute bag while refusing event-handler attributes that would bypass component lifecycle ownership.
 * @param {HTMLElement} element Target contract-owned DOM element.
 * @param {object} [attributes={}] Explicit stringifiable attribute mapping.
 * @returns {void}
 */
export function applyMitzvahUiAttributes(
	element,
	attributes = {}
) {
	for (const [name, value] of Object.entries(attributes || {})) {
		const normalizedName = String(name).trim().toLowerCase();
		if (!normalizedName || normalizedName.startsWith('on')) {
			continue;
		}
		if (value === null || value === undefined || value === false) {
			continue;
		}
		element.setAttribute(
			normalizedName,
			String(value)
		);
	}
}

/**
 * @description Gives newly created buttons a safe non-submit default while leaving adopted button type semantics untouched unless the caller explicitly supplies a replacement.
 * @param {HTMLElement} element Native button element receiving optional type policy.
 * @param {object} options Construction/adoption options containing type and preserveNative.
 * @returns {void}
 */
function applyButtonType(element, options) {
	if (options.type !== undefined) {
		element.setAttribute(
			'type',
			String(options.type)
		);
		return;
	}
	if (!options.preserveNative) {
		element.setAttribute('type', 'button');
	}
}
