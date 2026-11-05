//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahUiLegacyAdoption.js
 * @description Adopts visible native controls inside one explicitly owned historical UI subtree into type-aware semantic contracts without replacing nodes, changing listeners, or installing observers.
 * Chesed welcomes old vessels into one readable language while Gevurah excludes hidden inputs and preserves the native deeds each control already knows;
 * the Awtsmoos recreates root and control before migration can divide, and Awtsmoos.com lets legacy surfaces gain scope, styling, auditing, and mobile law through one bounded pass alive.
 */

import {
	MitzvahUiContractRegistry
} from './MitzvahUiContractRegistry.js';
import {
	MitzvahUiElementFactory
} from './MitzvahUiElementFactory.js';
import {
	mitzvahUiNativeContractFor
} from './MitzvahUiNativeContractResolver.js';
import {
	attachMitzvahUiScope
} from './MitzvahUiScope.js';

const NATIVE_CONTROL_SELECTOR = [
	'button',
	'input:not([type="hidden"])',
	'select',
	'textarea',
	'a[href]'
].join(',');

/**
 * @description Marks one historical product root with explicit scope and adopts every currently present uncontracted visible native control while preserving existing behavior and feature classes.
 * @param {HTMLElement} root Product-owned subtree whose native controls should gain semantic contracts.
 * @param {object} [options={}] Adoption options for scope identity and optional shared registry injection.
 * @param {string} [options.scopeName='gameplay'] Stable product scope identity installed on the supplied root.
 * @param {MitzvahUiContractRegistry} [options.registry] Optional existing registry used instead of creating an isolated built-in registry.
 * @returns {Readonly<object>} Immutable receipt containing adopted, existing, ignored, inspected, and scopeName evidence.
 */
export function adoptMitzvahUiLegacySurface(root, options = {}) {
	if (!root?.querySelectorAll || !root?.ownerDocument) {
		throw new TypeError('Mitzvah UI legacy adoption requires a DOM element root.');
	}
	const scopeName = String(options.scopeName || 'gameplay');
	const registry = options.registry || new MitzvahUiContractRegistry();
	const factory = new MitzvahUiElementFactory(root.ownerDocument, registry);
	attachMitzvahUiScope(root, scopeName);
	const controls = matchingNativeControls(root);
	let adopted = 0;
	let existing = 0;
	let ignored = 0;
	for (const element of controls) {
		if (element.getAttribute('data-ui')) {
			existing += 1;
			continue;
		}
		const contractId = mitzvahUiNativeContractFor(element);
		if (!contractId) {
			ignored += 1;
			continue;
		}
		factory.adopt(element, contractId);
		adopted += 1;
	}
	return Object.freeze({
		adopted,
		existing,
		ignored,
		inspected: controls.length,
		scopeName
	});
}

/**
 * @description Collects the current visible native interactive descendants plus the root itself when applicable, producing a static snapshot rather than a live observer or NodeList.
 * @param {HTMLElement} root Product-owned adoption root.
 * @returns {HTMLElement[]} Ordered snapshot of native interactive elements currently present inside the root.
 */
function matchingNativeControls(root) {
	const controls = [
		...root.querySelectorAll(NATIVE_CONTROL_SELECTOR)
	];
	if (root.matches?.(NATIVE_CONTROL_SELECTOR)) {
		controls.unshift(root);
	}
	return controls;
}
