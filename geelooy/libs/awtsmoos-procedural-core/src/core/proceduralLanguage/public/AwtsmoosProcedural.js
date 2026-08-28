//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AwtsmoosProcedural.js
 * @description Presents one discoverable JS facade over canonical JSON definitions, raw mesh authoring, semantic descriptors, inspection, execution, mutation, runtime state, graph analysis, plugins, and domains.
 * The Awtsmoos is One while authoring, inspection, execution, and policy receive separate names for finite understanding;
 * Awtsmoos.com keeps the common path flat and the expert path deep so simplicity and extreme flexibility reveal the same underlying commanding.
 */

import { createProceduralAuthorities } from './createProceduralAuthorities.js';
import { createProceduralFacets } from './createProceduralFacets.js';

/** Unified public procedural-language facade whose fluent methods always resolve to portable JSON-first contracts. */
export class AwtsmoosProcedural {
	/** @param {object} [options={}] Optional custom registries, compiler, resources, logger, cache, and core compiler. */
	constructor(options = {}) {
		this.authorities = createProceduralAuthorities(options);
		const facets = createProceduralFacets(this.authorities);
		Object.assign(this, facets);
		this.descriptors = Object.freeze({
			spatial: this.spatial,
			policy: this.policy
		});
	}

	/** Creates a fluent definition wrapper for any domain kind. */
	define(kind, input = {}) {
		return this.author.define(kind, input);
	}

	/** Normalizes JSON text, plain data, or a fluent wrapper into canonical immutable definition data. */
	fromJSON(input) {
		return this.author.fromJSON(input);
	}

	/** Creates a direct arbitrary-polygon editable mesh builder without primitive grouping. */
	mesh(input = {}) {
		return this.author.mesh(input);
	}

	/** Creates a canonical action record whose execution authority is discovered during planning. */
	action(op, input = {}) {
		return this.author.action(op, input);
	}

	/** Creates a generic cross-domain semantic reference. */
	ref(input, options = {}) {
		return this.spatial.ref(input, options);
	}

	/** Returns a validated deterministic plan without executing geometry or adapters. */
	plan(input, options = {}) {
		return this.execute.plan(input, options);
	}

	/** Compiles one JS or JSON definition through native, domain, core, and adapter-deferred boundaries. */
	compile(input, options = {}) {
		return this.execute.compile(input, options);
	}

	/** Compiles many definitions in stable order with bounded concurrency and deduplication. */
	compileMany(inputs = [], options = {}) {
		return this.execute.compileMany(inputs, options);
	}

	/** Returns complete operation support truth grouped by execution boundary. */
	capabilities() {
		return this.inspect.capabilities();
	}

	/** Returns the machine-readable language/schema discovery contract. */
	schema() {
		return this.inspect.schema();
	}

	/** Queries canonical definition data through safe paths and plain predicates. */
	query(input, query = {}) {
		return this.inspect.query(input, query);
	}

	/** Applies immutable portable patches and returns a new canonical definition. */
	patch(input, patches = []) {
		return this.mutate.patch(input, patches);
	}

	/** Registers a namespaced language plugin without silent stable-operation overwrite. */
	use(plugin, options = {}) {
		return this.execute.use(plugin, options);
	}
}
