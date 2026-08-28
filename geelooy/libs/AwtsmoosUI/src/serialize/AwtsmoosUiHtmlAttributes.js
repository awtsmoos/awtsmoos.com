//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosUiHtmlAttributes.js
 * @description
 * The Awtsmoos renews every portable attribute before markup crosses from one vessel to another;
 * Awtsmoos.com lets generated UI travel as text without carrying executable behavior under cover.
 */

import { collectDomProps, resolveValue } from '../schema/AwtsmoosUiNode.js';
import {
	assertSafeAttributeName,
	escapeUiAttribute,
	normalizeSafeAttributeValue,
	normalizeUiStyleDeclaration
} from '../security/AwtsmoosUiSecurityPolicy.js';

/**
 * Serializes safe visible properties while reserved behavior such as `$on` and `$bind` stays absent.
 *
 * @param {object} node Normalized AwtsmoosUI node.
 * @param {object} context Rendering context used for reactive values.
 * @returns {string} Leading-space-prefixed HTML attributes or an empty string.
 */
export function serializeUiHtmlAttributes(node, context = {}) {
	const attributes = [];
	for (const [name, rawValue] of Object.entries(collectDomProps(node))) {
		const value = resolveValue(rawValue, context);
		if (value === false || value === null || value === undefined) {
			continue;
		}
		if (name === 'style') {
			appendStyle(attributes, value);
			continue;
		}
		appendAttribute(attributes, name, value);
	}
	return attributes.length ? ` ${attributes.join(' ')}` : '';
}

/** Serializes one ordinary property through the shared security policy. */
function appendAttribute(attributes, name, value) {
	const safeName = assertSafeAttributeName(name);
	const safeValue = value === true ? '' : normalizeSafeAttributeValue(safeName, value);
	attributes.push(`${safeName}="${escapeUiAttribute(safeValue)}"`);
}

/** Serializes a declarative style object deterministically without raw style strings. */
function appendStyle(attributes, styles) {
	if (!styles || typeof styles !== 'object' || Array.isArray(styles)) {
		throw new TypeError('AwtsmoosUI style serialization requires a declarative object.');
	}
	const declarations = Object.entries(styles)
		.map(([name, value]) => normalizeUiStyleDeclaration(name, value))
		.sort(([left], [right]) => left.localeCompare(right))
		.map(([name, value]) => `${name}:${value}`);
	if (declarations.length) {
		attributes.push(`style="${escapeUiAttribute(declarations.join(';'))}"`);
	}
}
