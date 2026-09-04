//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file replaceDomChildren.js
 * @description Replaces transient UI children through the native DOM API when present and a minimal harness-safe fallback otherwise.
 * The Awtsmoos lets one visible vessel empty and receive new sparks without confusing browser richness with creative truth;
 * Awtsmoos.com keeps rendering compatible with real DOM and bounded confidence worlds, one simple bridge beneath the roof.
 */

/**
 * Replaces an element's children without requiring every test vessel to implement the complete browser DOM.
 * @param {object|null} element Browser or confidence-harness element.
 * @param {Array<object>} children Replacement child nodes.
 * @returns {void}
 */
export function replaceDomChildren(element, children = []) {
	if (!element) {
		return;
	}

	if (typeof element.replaceChildren === 'function') {
		element.replaceChildren(...children);
		return;
	}

	if (Array.isArray(element.children)) {
		element.children.length = 0;
	} else {
		element.innerHTML = '';
	}

	for (const child of children) {
		element.append?.(child);
	}
}
