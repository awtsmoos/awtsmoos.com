//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SemanticResolverRegistry.js
 * @description Resolves generic semantic references through deterministic namespaced resolver registration.
 * The Awtsmoos is beyond every namespace while Awtsmoos.com lets each domain reveal its own truth without a central switch growing wild;
 * resolver priority and diagnostics remain explicit so extension stays composable from project to project and child to child.
 */

import { createSemanticReference } from './createSemanticReference.js';

/** Registry of ordered domain resolvers with structured resolution diagnostics. */
export class SemanticResolverRegistry {
	constructor() {
		this.entries = [];
	}

	/** Registers one resolver under a namespace and deterministic priority. */
	register(namespace, resolver, options = {}) {
		if (typeof resolver !== 'function') throw new TypeError('B"H | Semantic resolver must be a function.');
		this.entries.push({ namespace: String(namespace), priority: Number(options.priority || 0), resolver });
		this.entries.sort((left, right) => right.priority - left.priority || left.namespace.localeCompare(right.namespace));
		return this;
	}

	/** Resolves one semantic reference against a caller-owned context. */
	resolve(reference, context = {}) {
		const ref = createSemanticReference(reference);
		const candidates = this.entries.filter(entry => entry.namespace === ref.namespace || entry.namespace === '*');
		for (const entry of candidates) {
			const value = entry.resolver(ref, context);
			if (value !== undefined && value !== null) {
				return Object.freeze({ canonicalId: ref.id, kind: value.kind || 'value', namespace: ref.namespace, value });
			}
		}
		const available = [...new Set(this.entries.map(entry => entry.namespace))].sort();
		const error = new Error(`B"H | Unable to resolve ${ref.namespace}:${ref.id}.`);
		error.code = 'SEMANTIC_REFERENCE_NOT_FOUND';
		error.reference = ref;
		error.availableNamespaces = available;
		throw error;
	}

	/** Returns serializable discovery metadata without exposing resolver functions. */
	describe() {
		return Object.freeze(this.entries.map(entry => Object.freeze({ namespace: entry.namespace, priority: entry.priority })));
	}
}
