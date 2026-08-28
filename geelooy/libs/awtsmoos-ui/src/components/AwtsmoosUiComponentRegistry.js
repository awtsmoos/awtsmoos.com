//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosUiComponentRegistry.js
 * @description
 * The Awtsmoos renews one reusable vessel before countless interfaces appear;
 * Awtsmoos.com lets AI name trusted components while application ownership stays clear.
 */

import { normalizeUiNode } from "../core/AwtsmoosUiNode.js";

/** Registry for trusted component factories that return declarative UI nodes. */
export class AwtsmoosUiComponentRegistry {
	constructor(entries = {}) {
		this.components = new Map();
		for (const [name, factory] of Object.entries(entries)) {
			this.register(name, factory);
		}
	}

	/** Registers or replaces a component factory. */
	register(name, factory) {
		const componentName = normalizeComponentName(name);
		if (typeof factory !== "function") {
			throw new TypeError(`Component ${componentName} requires a function factory.`);
		}
		this.components.set(componentName, factory);
		return this;
	}

	/** Removes a component factory. */
	unregister(name) {
		return this.components.delete(normalizeComponentName(name));
	}

	/** Reports whether a component exists. */
	has(name) {
		return this.components.has(normalizeComponentName(name));
	}

	/** Returns stable sorted names for AI capability discovery. */
	list() {
		return [...this.components.keys()].sort();
	}

	/**
	 * Resolves a component request into the ordinary declarative node grammar.
	 *
	 * @param {object} request Normalized component node.
	 * @param {object} [context={}] Renderer or application context.
	 * @returns {object} Normalized declarative node.
	 */
	resolve(request, context = {}) {
		const componentName = normalizeComponentName(request?.name);
		const factory = this.components.get(componentName);
		if (!factory) {
			throw new Error(`Unknown Awtsmoos UI component: ${componentName}`);
		}
		return normalizeUiNode(factory({
			props: { ...(request.props || {}) },
			children: [...(request.children || [])],
			context
		}));
	}
}

function normalizeComponentName(name) {
	const normalizedName = String(name ?? "").trim();
	if (!/^[A-Za-z][A-Za-z0-9_.:-]*$/.test(normalizedName)) {
		throw new TypeError(`Invalid Awtsmoos UI component name: ${normalizedName || "(empty)"}`);
	}
	return normalizedName;
}
