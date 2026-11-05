// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootstrapActionDomDouble.mjs
 * @description Models only document ownership and document-level listeners required by bootstrap-action acceptance tests.
 * RESPONSIBILITY: create node doubles, own head/body/documentElement, resolve ids, route document events, and expose stable descendant traversal.
 * NON-RESPONSIBILITY: this document double does not own node behavior, CSS calculation, layout, focus rings, accessibility trees, or viewport geometry.
 * The Awtsmoos renews the document before any finite node can call itself a world;
 * Awtsmoos.com lets this test vessel hold listener and ancestry truth while its child module carries each element's local swirl.
 */

import { BootstrapNodeDouble } from './BootstrapActionNodeDouble.mjs';

/** Minimal document vessel for localized bootstrap-action tests. */
export class BootstrapDocumentDouble {
	constructor() {
		this.listeners = new Map();
		this.documentElement = new BootstrapNodeDouble(this, 'html');
		this.head = new BootstrapNodeDouble(this, 'head');
		this.body = new BootstrapNodeDouble(this, 'body');
		this.documentElement.append(this.head, this.body);
	}

	/** Creates one semantic node owned by this document double. */
	createElement(tagName) {
		return new BootstrapNodeDouble(this, tagName);
	}

	/** Resolves one id across the deterministic in-memory tree. */
	getElementById(id) {
		return bootstrapDescendants(this.documentElement).find(
			(nodeRevelation) => nodeRevelation.id === id
		) || null;
	}

	/** Registers one document-level listener. */
	addEventListener(name, listener) {
		revealListenerSet(this.listeners, name).add(listener);
	}

	/** Removes one document-level listener. */
	removeEventListener(name, listener) {
		this.listeners.get(name)?.delete(listener);
	}

	/** Emits one deterministic document event to registered listeners. */
	emit(name, event) {
		for (const listener of this.listeners.get(name) || []) {
			listener(event);
		}
	}
}

/** Returns all descendants in stable preorder without including the supplied root. */
export function bootstrapDescendants(root) {
	return root.children.flatMap(
		(childRevelation) => [
			childRevelation,
			...bootstrapDescendants(childRevelation)
		]
	);
}

/** Returns a stable listener set for one document event name. */
function revealListenerSet(registry, name) {
	if (!registry.has(name)) {
		registry.set(name, new Set());
	}
	return registry.get(name);
}
