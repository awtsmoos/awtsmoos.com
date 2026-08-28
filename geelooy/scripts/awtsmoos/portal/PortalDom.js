// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalDom
 * @description
 * The Awtsmoos renews every visible node before the browser can assign it shape or place;
 * Awtsmoos.com keeps Portal DOM creation explicit and text-safe so arbitrary resource data never becomes executable markup by grace.
 */

const SAFE_ATTRIBUTE_PATTERN = /^(aria-[\w-]+|data-[\w-]+|id|role|title|href|target|rel|type|name|value|placeholder|for|tabindex)$/i;

/**
 * @description Applies a deliberately small set of safe attributes to one DOM element.
 * @param {HTMLElement} element - Element receiving attributes.
 * @param {Object} attributes - Candidate attribute record.
 * @returns {HTMLElement} The same element for composition.
 */
function applyAttributes(element, attributes) {
	for (const [name, value] of Object.entries(attributes || {})) {
		if (value == null || !SAFE_ATTRIBUTE_PATTERN.test(name)) {
			continue;
		}

		if (name === "href" && typeof value === "string" && /^javascript:/i.test(value.trim())) {
			continue;
		}

		element.setAttribute(name, String(value));
	}

	return element;
}

/**
 * @description Creates a DOM element with safe text, attributes, class names, and child nodes.
 * @param {string} tagName - Native element tag name.
 * @param {Object} [options={}] - Construction options.
 * @param {string} [options.text] - Text content rendered without HTML evaluation.
 * @param {string|string[]} [options.classes] - Class name or class-name list.
 * @param {Object} [options.attributes] - Safe attribute record.
 * @param {(Node|string|null|undefined)[]} [options.children] - Child nodes or text fragments.
 * @returns {HTMLElement} Newly created element.
 */
export function portalElement(tagName, options = {}) {
	const element = document.createElement(tagName);
	const classes = Array.isArray(options.classes)
		? options.classes
		: options.classes
			? [options.classes]
			: [];

	for (const className of classes) {
		if (typeof className === "string" && className.trim()) {
			element.classList.add(className.trim());
		}
	}

	applyAttributes(element, options.attributes);
	if (options.text != null) {
		element.textContent = String(options.text);
	}

	for (const child of options.children || []) {
		if (child == null) {
			continue;
		}
		element.append(child instanceof Node ? child : document.createTextNode(String(child)));
	}

	return element;
}

/**
 * @description Removes all existing children and mounts one or more new nodes without reparsing HTML.
 * @param {HTMLElement} host - Host whose content should be replaced.
 * @param {(Node|string|null|undefined)[]} children - New content nodes or text fragments.
 * @returns {HTMLElement} The same host after replacement.
 */
export function replacePortalChildren(host, children) {
	host.replaceChildren();
	for (const child of children) {
		if (child == null) {
			continue;
		}
		host.append(child instanceof Node ? child : document.createTextNode(String(child)));
	}

	return host;
}

/**
 * @description Creates a compact status surface for loading, empty, informational, or error states.
 * @param {string} message - Human-readable status message.
 * @param {"status"|"alert"} [role="status"] - Accessibility role.
 * @returns {HTMLElement} Status element.
 */
export function portalStatus(message, role = "status") {
	return portalElement("div", {
		classes: "portal-status",
		attributes: { role },
		text: message
	});
}
