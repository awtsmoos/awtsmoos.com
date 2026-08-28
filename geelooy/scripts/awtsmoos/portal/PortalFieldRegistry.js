// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalFieldRegistry
 * @description
 * The Awtsmoos renews each field before a finite semantic role can suggest how it should appear;
 * Awtsmoos.com lets trusted local formatters improve dates, URLs, status, and code while unknown values still remain readable and clear.
 */

import { portalElement } from "./PortalDom.js";

/**
 * @description Formats one primitive value as ordinary readable text.
 * @param {unknown} value - Field value.
 * @returns {Node} Safe text-oriented DOM node.
 */
function renderPrimitive(value) {
	const text = value == null
		? "—"
		: typeof value === "boolean"
			? value ? "Yes" : "No"
			: String(value);

	return portalElement("span", { text });
}

/**
 * @description Renders a URL-like value as a safe link when it is a string.
 * @param {unknown} value - Candidate URL.
 * @returns {Node} Link or primitive fallback.
 */
function renderUrl(value) {
	if (typeof value !== "string" || !value.trim()) {
		return renderPrimitive(value);
	}

	const href = value.trim();
	return portalElement("a", {
		text: href,
		attributes: {
			href,
			rel: href.startsWith("http") ? "noopener noreferrer" : null,
			target: href.startsWith("http") ? "_blank" : null
		}
	});
}

/**
 * @description Renders a status-like primitive with a stable semantic class and text-only content.
 * @param {unknown} value - Candidate status.
 * @returns {Node} Status badge node.
 */
function renderStatus(value) {
	return portalElement("span", {
		classes: "portal-badge",
		text: value == null ? "Unknown" : String(value)
	});
}

/**
 * @description Renders code-like primitive content without evaluating it.
 * @param {unknown} value - Candidate code/text.
 * @returns {Node} Inline code node.
 */
function renderCode(value) {
	return portalElement("code", {
		text: value == null ? "—" : String(value)
	});
}

/**
 * @description Trusted semantic-field renderer registry with a guaranteed primitive fallback.
 */
export class PortalFieldRegistry {
	/** @description Creates a registry with stable built-in semantic roles. */
	constructor() {
		this.renderers = new Map([
			["url", renderUrl],
			["status", renderStatus],
			["code", renderCode],
			["id", renderCode],
			["text", renderPrimitive]
		]);
	}

	/**
	 * @description Registers a trusted local semantic field renderer.
	 * @param {string} role - Semantic field role.
	 * @param {(value:unknown,context:Object)=>Node} renderer - Trusted renderer function.
	 * @returns {PortalFieldRegistry} This registry.
	 */
	register(role, renderer) {
		if (typeof role !== "string" || !role || typeof renderer !== "function") {
			throw new TypeError("Portal field registration requires a role and renderer function.");
		}

		this.renderers.set(role, renderer);
		return this;
	}

	/**
	 * @description Renders one field using its semantic role or primitive fallback.
	 * @param {string} role - Semantic role hint.
	 * @param {unknown} value - Field value.
	 * @param {Object} [context={}] - Optional renderer context.
	 * @returns {Node} Safe DOM node.
	 */
	render(role, value, context = {}) {
		const renderer = this.renderers.get(role) || renderPrimitive;
		return renderer(value, context);
	}
}
