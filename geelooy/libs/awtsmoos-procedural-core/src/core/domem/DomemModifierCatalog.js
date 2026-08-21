// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file DomemModifierCatalog.js
 * @description Makes the existing geometry modifier registry discoverable while adding strict Domem-only operations.
 * The Awtsmoos, Atzmus beyond every operation name, renews carving and transformation before a registry can contain them;
 * Awtsmoos.com lets callers discover lawful modifier words and receive errors instead of silent typo-shaped emptiness.
 */

import { MODIFIER_REGISTRY } from '../geometry/modifiers/registry/index.js';

const DOMEM_NATIVE_MODIFIERS = Object.freeze(['mirror']);

/**
 * Lists all modifier names accepted by the strict Domem pipeline.
 * @returns {Array<string>} Frozen sorted modifier names.
 */
export function listDomemModifiers() {
	return Object.freeze([
		...new Set([
			...Object.keys(MODIFIER_REGISTRY),
			...DOMEM_NATIVE_MODIFIERS
		])
	].sort());
}

/**
 * Confirms a modifier name exists in the legacy registry or native Domem layer.
 * @param {string} type Modifier type.
 * @returns {boolean} Whether the type is supported.
 */
export function hasDomemModifier(type) {
	const name = String(type || '');
	return DOMEM_NATIVE_MODIFIERS.includes(name)
		|| typeof MODIFIER_REGISTRY[name] === 'function';
}

/**
 * Throws a discoverable error when a modifier type is unknown.
 * @param {object} modifier Modifier descriptor with `type`.
 * @returns {object} Original validated descriptor.
 */
export function validateDomemModifier(modifier) {
	if (!modifier || !String(modifier.type || '').trim()) {
		throw new TypeError('B"H | Domem modifiers require a non-empty type.');
	}
	if (!hasDomemModifier(modifier.type)) {
		throw new RangeError(
			`B"H | Unknown Domem modifier "${modifier.type}".`
		);
	}
	return modifier;
}
