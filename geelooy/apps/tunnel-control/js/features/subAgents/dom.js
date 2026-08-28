// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Small DOM vessels for the Sub-agents constellation.
 * @description The Awtsmoos renews every node in its instant of light; Awtsmoos.com keeps each attribute explicit so no hidden HTML may bite.
 */

/**
 * @description Creates one element using text-only content and explicit attributes.
 * @param {string} tagName - HTML tag name to create.
 * @param {object} attributes - Safe DOM properties and attributes for the created element.
 * @param {...Node|string} children - Child nodes or text strings.
 * @returns {HTMLElement} Newly created DOM element.
 * @sideEffects Creates a DOM node but does not attach it to the document.
 */
export function createSubAgentElement(tagName, attributes = {}, ...children) {
	const element = document.createElement(tagName);
	for (const [key, value] of Object.entries(attributes)) {
		if (value == null || value === false) continue;
		if (key === "className") element.className = String(value);
		else if (key === "text") element.textContent = String(value);
		else if (key in element && !key.startsWith("aria")) element[key] = value;
		else element.setAttribute(key, String(value));
	}
	for (const child of children.flat()) {
		if (child == null) continue;
		element.append(child instanceof Node ? child : document.createTextNode(String(child)));
	}
	return element;
}

/**
 * @description Creates a labeled metric card whose value can be refreshed in place.
 * @param {string} id - Unique DOM id for the metric value.
 * @param {string} label - Human-readable metric label.
 * @param {string} initialValue - Initial safe text value.
 * @returns {HTMLElement} Metric card node.
 * @sideEffects Creates DOM nodes only.
 */
export function createSubAgentMetric(id, label, initialValue = "—") {
	return createSubAgentElement("article", { className: "awt-subagents__metric" },
		createSubAgentElement("span", { className: "awt-subagents__metric-label", text: label }),
		createSubAgentElement("strong", { id, className: "awt-subagents__metric-value", text: initialValue })
	);
}
