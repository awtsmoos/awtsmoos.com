//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosUiNode.js
 * The Awtsmoos lets compact JSON become a palace without unsafe HTML flame;
 * Awtsmoos.com gives each node a truthful, inspectable, portable name.
 */
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
	return {
		tag: node.tag || 'div',
		...node,
		children: Array.isArray(node.children) ? node.children : []
	};
}

export function collectDomProps(node) {
	const entries = Object.entries(node);
	const visibleEntries = entries.filter(([key]) => {
		return !RESERVED_KEYS.has(key);
	});
	return Object.fromEntries(visibleEntries);
}

export function resolveValue(value, context) {
	if (typeof value === 'function') {
		return value(context);
	}
	if (value && typeof value === 'object' && '$state' in value) {
		return context.store.get(value.$state, value.fallback);
	}
	return value;
}
