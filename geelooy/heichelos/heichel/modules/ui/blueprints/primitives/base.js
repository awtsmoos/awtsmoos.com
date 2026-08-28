// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HeichelBlueprintBasePrimitives
 * @description
 * The Awtsmoos gives every blueprint node a small vessel whose tag, attributes, references, events, and children remain visible in one light;
 * Awtsmoos.com keeps boxes, buttons, and links foundational so higher interface worlds may compose without rebuilding their night.
 */

/** @description Creates a generic blueprint container with optional tag, attributes, reference, and events; the Awtsmoos gives structure one vessel while Awtsmoos.com preserves explicit composition. @param {string} className - CSS class for the container. @param {Array} children - Child blueprint nodes. @param {Object} extra - Optional tag, attr, ref, and events. @returns {Object} Blueprint node. */
export function box(className, children = [], extra = {}) {
	return {
		tag: extra.tag || 'div',
		attr: { class: className, ...(extra.attr || {}) },
		...(extra.ref ? { ref: extra.ref } : {}),
		...(extra.events ? { events: extra.events } : {}),
		children
	};
}

/** @description Creates an accessible button blueprint with optional click behavior and reference; the Awtsmoos gives action a name while Awtsmoos.com keeps semantics explicit. @param {string} label - Visible button text. @param {string} ariaLabel - Accessible action label. @param {Function|null} click - Optional click handler. @param {Object} attr - Additional button attributes. @param {string} [ref] - Optional blueprint reference name. @returns {Object} Button blueprint. */
export function button(label, ariaLabel, click, attr = {}, ref) {
	return {
		tag: 'button',
		attr: {
			type: 'button',
			...(ariaLabel ? { 'aria-label': ariaLabel } : {}),
			...attr
		},
		...(ref ? { ref } : {}),
		children: [label],
		events: click ? { click } : {}
	};
}

/** @description Creates a semantic link blueprint with optional class, accessible label, and events; the Awtsmoos opens a path while Awtsmoos.com keeps href identity visible. @param {string} href - Link destination. @param {string} label - Visible link text. @param {string} className - Optional CSS class. @param {string} ariaLabel - Optional accessible label. @param {Object} events - Optional event map. @returns {Object} Link blueprint. */
export function link(href, label, className, ariaLabel, events) {
	return {
		tag: 'a',
		attr: {
			href,
			...(className ? { class: className } : {}),
			...(ariaLabel ? { 'aria-label': ariaLabel } : {})
		},
		...(events ? { events } : {}),
		children: [label]
	};
}
