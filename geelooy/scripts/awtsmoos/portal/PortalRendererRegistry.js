// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalRendererRegistry
 * @description
 * The Awtsmoos renews each resource before one finite renderer can reveal its present form;
 * Awtsmoos.com keeps renderer registration trusted, deterministic, and diagnosable so new types extend the Portal without client storm.
 */

import { selectPortalRenderer } from "./PortalRendererSelection.js";

/**
 * @description Registry of trusted local renderer functions; API payloads may request semantic IDs but can never register executable code.
 */
export class PortalRendererRegistry {
	/**
	 * @description Creates an empty trusted renderer registry.
	 */
	constructor() {
		this.renderers = new Map();
	}

	/**
	 * @description Registers one trusted renderer under a deterministic type/view key.
	 * @param {string} type - Namespaced type identifier or `*` fallback.
	 * @param {string} view - Render mode such as `detail`, `card`, or `*`.
	 * @param {(resource:Object,context:Object)=>Node} renderer - Trusted local renderer function.
	 * @returns {PortalRendererRegistry} This registry for fluent composition.
	 * @throws {TypeError} When inputs are malformed or a key is already registered.
	 */
	register(type, view, renderer) {
		if (typeof type !== "string" || !type || typeof view !== "string" || !view) {
			throw new TypeError("Portal renderer registration requires type and view identifiers.");
		}
		if (typeof renderer !== "function") {
			throw new TypeError("Portal renderer must be a trusted local function.");
		}

		const key = `${type}:${view}`;
		if (this.renderers.has(key)) {
			throw new TypeError(`Portal renderer already registered for ${key}.`);
		}

		this.renderers.set(key, renderer);
		return this;
	}

	/**
	 * @description Selects a renderer for one type/view combination without executing it.
	 * @param {string} type - Resource type identifier.
	 * @param {string} [view="detail"] - Requested render mode.
	 * @returns {{renderer:Function|null,key:string|null,reason:string}} Selection diagnostics.
	 */
	select(type, view = "detail") {
		return selectPortalRenderer(this.renderers, type, view);
	}

	/**
	 * @description Renders one resource with deterministic selection and exposes selection diagnostics to the rendering context.
	 * @param {Object} resource - Normalized Portal resource.
	 * @param {string} [view="detail"] - Requested render mode.
	 * @param {Object} [context={}] - Shared renderer context.
	 * @returns {Node} DOM node returned by the selected renderer.
	 * @throws {Error} When no trusted fallback renderer exists.
	 */
	render(resource, view = "detail", context = {}) {
		const selection = this.select(resource.type, view);
		if (!selection.renderer) {
			throw new Error(`No Portal renderer is registered for ${resource.type}:${view}.`);
		}

		return selection.renderer(resource, {
			...context,
			registry: this,
			selection,
			view
		});
	}

	/**
	 * @description Lists renderer keys for developer inspection without exposing mutable registry internals.
	 * @returns {string[]} Sorted renderer keys.
	 */
	keys() {
		return [...this.renderers.keys()].sort();
	}
}
