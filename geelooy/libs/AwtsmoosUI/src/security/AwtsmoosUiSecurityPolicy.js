//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosUiSecurityPolicy.js
 * @description
 * The Awtsmoos renews each boundary before generated intention enters browser space;
 * Awtsmoos.com gives JSON wide creative power while Gevurah keeps executable danger in its place.
 */

const SAFE_TAG_PATTERN = /^[a-z][a-z0-9-]*$/;
const SAFE_ATTRIBUTE_PATTERN = /^[A-Za-z_:][A-Za-z0-9_.:-]*$/;
const SAFE_EVENT_PATTERN = /^[A-Za-z][A-Za-z0-9:_-]*$/;
const SAFE_BINDING_PATTERN = /^[A-Za-z_$][A-Za-z0-9_$:-]*$/;
const SAFE_STYLE_PATTERN = /^(?:--[A-Za-z0-9_-]+|[A-Za-z][A-Za-z0-9-]*)$/;
const BLOCKED_TAGS = new Set(['base', 'embed', 'iframe', 'link', 'meta', 'object', 'script', 'style']);
const BLOCKED_BINDINGS = new Set(['__proto__', 'constructor', 'innerHTML', 'outerHTML', 'prototype', 'srcdoc', 'style']);
const URL_NAMES = new Set(['action', 'cite', 'formaction', 'href', 'poster', 'src', 'srcset', 'xlink:href']);
const DANGEROUS_URL = /^\s*(?:data|javascript|vbscript):/i;
const DANGEROUS_STYLE = /(?:expression\s*\(|javascript\s*:|vbscript\s*:|url\s*\(\s*['"]?\s*(?:data|javascript|vbscript):)/i;

/** Validates normal tags while preserving renderer-only fragment symbols. */
export function assertSafeUiTag(tag) {
	const normalizedTag = String(tag ?? '').trim().toLowerCase();
	if (normalizedTag === '#text' || normalizedTag === '#fragment') {
		return normalizedTag;
	}
	if (!SAFE_TAG_PATTERN.test(normalizedTag) || BLOCKED_TAGS.has(normalizedTag)) {
		throw new TypeError(`Unsafe AwtsmoosUI tag: ${normalizedTag || '(empty)'}`);
	}
	return normalizedTag;
}

/** Rejects malformed attributes and inline event-handler names. */
export function assertSafeAttributeName(name) {
	const normalizedName = String(name ?? '').trim();
	if (!SAFE_ATTRIBUTE_PATTERN.test(normalizedName) || /^on/i.test(normalizedName) || normalizedName.toLowerCase() === 'srcdoc') {
		throw new TypeError(`Unsafe AwtsmoosUI attribute: ${normalizedName || '(empty)'}`);
	}
	return normalizedName;
}

/** Checks URL-bearing names while preserving the original property value type. */
export function assertSafePropertyValue(name, value) {
	const normalizedName = String(name ?? '').toLowerCase();
	if (URL_NAMES.has(normalizedName) && DANGEROUS_URL.test(String(value ?? ''))) {
		throw new TypeError(`Unsafe URL protocol for AwtsmoosUI ${normalizedName}.`);
	}
	return value;
}

/** Converts an already-policy-checked attribute value into serializable text. */
export function normalizeSafeAttributeValue(name, value) {
	return String(assertSafePropertyValue(name, value) ?? '');
}

/** Normalizes camelCase CSS names and rejects executable style declarations. */
export function normalizeUiStyleDeclaration(name, value) {
	const rawName = String(name ?? '').trim();
	const cssName = rawName.startsWith('--') ? rawName : rawName.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);
	const cssValue = String(value ?? '').trim();
	if (!SAFE_STYLE_PATTERN.test(cssName) || DANGEROUS_STYLE.test(cssValue)) {
		throw new TypeError(`Unsafe AwtsmoosUI style declaration: ${rawName || '(empty)'}`);
	}
	return [cssName, cssValue];
}

/** Validates addEventListener names before generated schemas reach the DOM. */
export function assertSafeEventName(name) {
	const normalizedName = String(name ?? '').trim().toLowerCase();
	if (!SAFE_EVENT_PATTERN.test(normalizedName) || normalizedName.startsWith('on')) {
		throw new TypeError(`Unsafe AwtsmoosUI event: ${normalizedName || '(empty)'}`);
	}
	return normalizedName;
}

/** Blocks DOM sink properties while keeping ordinary reactive binding names extensible. */
export function assertSafeBindingName(name) {
	const normalizedName = String(name ?? '').trim();
	if (!SAFE_BINDING_PATTERN.test(normalizedName) || /^on/i.test(normalizedName) || BLOCKED_BINDINGS.has(normalizedName)) {
		throw new TypeError(`Unsafe AwtsmoosUI binding: ${normalizedName || '(empty)'}`);
	}
	return normalizedName;
}

/** Escapes untrusted values for text or attribute HTML serialization. */
export function escapeUiHtml(value) {
	return String(value ?? '')
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

export const escapeUiAttribute = escapeUiHtml;
