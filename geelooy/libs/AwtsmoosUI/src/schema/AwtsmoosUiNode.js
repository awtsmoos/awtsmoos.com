//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosUiNode.js
 * @description
 * The Awtsmoos lets compact JSON become a palace while every tag still passes through a gate;
 * Awtsmoos.com keeps AI-authored nodes portable and inspectable without letting spread order rewrite fate.
 */

import { assertSafeUiTag } from '../security/AwtsmoosUiSecurityPolicy.js';

const RESERVED_KEYS = new Set([
	'tag',
	'text',
	'children',
	'$when',
	'$each',
	'$on',
	'$bind',
	'key'
]);

/**
 * Normalizes primitives, arrays, and JSON-like element descriptions into one trusted node grammar.
 *
 * @param {*} node Candidate schema value.
 * @returns {object|null} Normalized node or null for intentionally empty values.
 */
export function normalizeUiNode(node) {
	if (node === null || node === undefined || node === false) {
		return null;
	}
	if (typeof node === 'string' || typeof node === 'number') {
		return {
			tag: '#text',
			text: String(node)
		};
	}
	if (Array.isArray(node)) {
		return {
			tag: '#fragment',
			children: node
		};
	}
	if (typeof node !== 'object') {
		throw new TypeError('AwtsmoosUI nodes must be JSON-like values.');
	}
	const safeTag = assertSafeUiTag(node.tag || 'div');
	return {
		...node,
		tag: safeTag,
		children: Array.isArray(node.children) ? node.children : []
	};
}

/**
 * Separates visible DOM properties from renderer-reserved behavioral keys.
 *
 * @param {object} node Normalized node.
 * @returns {object} Ordinary DOM-facing properties.
 */
export function collectDomProps(node) {
	const visibleEntries = Object.entries(node).filter(([key]) => {
		return !RESERVED_KEYS.has(key);
	});
	return Object.fromEntries(visibleEntries);
}

/**
 * Resolves functions and Store references while leaving literal values unchanged.
 *
 * @param {*} value Literal, function, or `$state` reference.
 * @param {object} context Current rendering context.
 * @returns {*} Resolved value.
 */
export function resolveValue(value, context) {
	if (typeof value === 'function') {
		return value(context);
	}
	if (value && typeof value === 'object' && '$state' in value) {
		return context.store.get(value.$state, value.fallback);
	}
	return value;
}
