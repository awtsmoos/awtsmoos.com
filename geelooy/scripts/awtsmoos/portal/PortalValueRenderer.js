// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalValueRenderer
 * @description
 * The Awtsmoos renews forms no client has yet imagined, while every finite phone still needs bounded work;
 * Awtsmoos.com renders arbitrary values safely through depth, width, and collection budgets so unknown data remains useful instead of turning into a frozen quirk.
 */

import { portalElement } from "./PortalDom.js";

const DEFAULT_BUDGET = Object.freeze({
	maxArrayItems: 40,
	maxDepth: 6,
	maxObjectFields: 60,
	maxStringLength: 8000
});

/**
 * @description Produces a readable label from a machine-oriented field key.
 * @param {string} key - Object field name.
 * @returns {string} Humanized field label.
 */
function fieldLabel(key) {
	return String(key)
		.replace(/([a-z0-9])([A-Z])/g, "$1 $2")
		.replace(/[_-]+/g, " ")
		.replace(/^./, (character) => character.toUpperCase());
}

/**
 * @description Renders an arbitrary JSON-compatible value inside explicit recursion and width budgets.
 * @param {unknown} value - Value to render.
 * @param {Object} [options={}] - Rendering options and recursion state.
 * @param {number} [options.depth=0] - Current recursion depth.
 * @param {Object} [options.budget=DEFAULT_BUDGET] - Maximum safe render budget.
 * @returns {Node} Safe DOM representation of the value.
 */
export function renderPortalValue(value, options = {}) {
	const depth = options.depth ?? 0;
	const budget = options.budget ?? DEFAULT_BUDGET;
	if (depth >= budget.maxDepth && value && typeof value === "object") {
		return portalElement("span", { classes: "portal-truncated", text: "Nested value omitted at depth limit." });
	}

	if (value == null) {
		return portalElement("span", { classes: "portal-null", text: "—" });
	}
	if (typeof value === "string") {
		const truncated = value.length > budget.maxStringLength;
		return portalElement("span", {
			text: truncated ? `${value.slice(0, budget.maxStringLength)}…` : value
		});
	}
	if (["number", "boolean", "bigint"].includes(typeof value)) {
		return portalElement("span", { text: String(value) });
	}
	if (Array.isArray(value)) {
		return renderPortalArray(value, { depth, budget });
	}
	if (typeof value === "object") {
		return renderPortalObject(value, { depth, budget });
	}

	return portalElement("code", { text: String(value) });
}

/**
 * @description Renders a bounded array as an intentional list with a truncation receipt when needed.
 * @param {unknown[]} values - Array values.
 * @param {{depth:number,budget:Object}} options - Current recursion state.
 * @returns {Node} Bounded list node.
 */
function renderPortalArray(values, options) {
	const visible = values.slice(0, options.budget.maxArrayItems);
	const list = portalElement("ol", {
		classes: "portal-value-list",
		children: visible.map((value) => portalElement("li", {
			children: [renderPortalValue(value, { ...options, depth: options.depth + 1 })]
		}))
	});
	if (values.length > visible.length) {
		list.append(portalElement("li", { classes: "portal-truncated", text: `${values.length - visible.length} more items not expanded.` }));
	}

	return list;
}

/**
 * @description Renders a bounded object as a semantic definition list instead of an unstyled JSON dump.
 * @param {Object} value - Plain or JSON-compatible object.
 * @param {{depth:number,budget:Object}} options - Current recursion state.
 * @returns {Node} Bounded definition-list node.
 */
function renderPortalObject(value, options) {
	const entries = Object.entries(value).slice(0, options.budget.maxObjectFields);
	const list = portalElement("dl", { classes: "portal-value-object" });
	for (const [key, nested] of entries) {
		list.append(
			portalElement("dt", { text: fieldLabel(key) }),
			portalElement("dd", { children: [renderPortalValue(nested, { ...options, depth: options.depth + 1 })] })
		);
	}
	if (Object.keys(value).length > entries.length) {
		list.append(portalElement("dt", { text: "More" }), portalElement("dd", { classes: "portal-truncated", text: "Additional fields omitted by render budget." }));
	}

	return list;
}

export { DEFAULT_BUDGET };
