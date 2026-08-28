//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosUiNode.js
 * @description
 * The Awtsmoos renews one semantic tree before browser form gives it a face;
 * Awtsmoos.com lets AI describe intention as data, while renderers choose the proper place.
 */

const SAFE_TAG_PATTERN = /^[a-z][a-z0-9-]*$/;
const BLOCKED_TAGS = new Set(["base", "embed", "iframe", "link", "meta", "object", "script"]);

export const UI_NODE_TYPES = Object.freeze({
	TEXT: "text",
	ELEMENT: "element",
	FRAGMENT: "fragment",
	COMPONENT: "component"
});

/** Creates a declarative text node. */
export function uiText(value) {
	return { type: UI_NODE_TYPES.TEXT, value: String(value ?? "") };
}

/** Creates a declarative element node after checking the tag boundary. */
export function uiElement(tag, options = {}) {
	const safeTag = assertSafeUiTag(tag);
	return {
		type: UI_NODE_TYPES.ELEMENT,
		tag: safeTag,
		attrs: { ...(options.attrs || {}) },
		classes: normalizeClassList(options.classes),
		style: { ...(options.style || {}) },
		dataset: { ...(options.dataset || {}) },
		on: { ...(options.on || {}) },
		children: normalizeUiChildren(options.children || [])
	};
}

/** Creates a fragment whose children remain renderer-neutral. */
export function uiFragment(children = []) {
	return { type: UI_NODE_TYPES.FRAGMENT, children: normalizeUiChildren(children) };
}

/** Creates a named component request resolved by a component registry. */
export function uiComponent(name, props = {}, children = []) {
	const componentName = String(name ?? "").trim();
	if (!componentName) {
		throw new TypeError("UI component name must not be empty.");
	}
	return {
		type: UI_NODE_TYPES.COMPONENT,
		name: componentName,
		props: { ...props },
		children: normalizeUiChildren(children)
	};
}

/** Normalizes primitive, array, and declarative object inputs into one grammar. */
export function normalizeUiNode(input) {
	if (input === null || input === undefined || input === false) {
		return uiText("");
	}
	if (Array.isArray(input)) {
		return uiFragment(input);
	}
	if (["string", "number", "bigint"].includes(typeof input)) {
		return uiText(input);
	}
	if (input?.type === UI_NODE_TYPES.TEXT) {
		return uiText(input.value);
	}
	if (input?.type === UI_NODE_TYPES.FRAGMENT) {
		return uiFragment(input.children);
	}
	if (input?.type === UI_NODE_TYPES.COMPONENT || input?.component) {
		return uiComponent(input.name || input.component, input.props, input.children);
	}
	if (input?.type === UI_NODE_TYPES.ELEMENT || input?.tag) {
		return uiElement(input.tag, input);
	}
	throw new TypeError("Unsupported Awtsmoos UI node input.");
}

/** Normalizes and flattens one level of declarative children. */
export function normalizeUiChildren(children) {
	return (Array.isArray(children) ? children : [children])
		.flat()
		.map(normalizeUiNode);
}

/** Rejects dangerous or malformed HTML tag names. */
export function assertSafeUiTag(tag) {
	const normalizedTag = String(tag ?? "").trim().toLowerCase();
	if (!SAFE_TAG_PATTERN.test(normalizedTag) || BLOCKED_TAGS.has(normalizedTag)) {
		throw new TypeError(`Unsafe UI tag: ${normalizedTag || "(empty)"}`);
	}
	return normalizedTag;
}

function normalizeClassList(classes) {
	if (Array.isArray(classes)) {
		return classes.map(String).filter(Boolean);
	}
	return String(classes || "").split(/\s+/).filter(Boolean);
}
