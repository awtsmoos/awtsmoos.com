//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralExecutionApi.js
 * @description Exposes planning, compilation, batching, patching, semantic resolution, plugins, domain/generator registration, and explicit cache control through one professional execution surface.
 * The Awtsmoos is One while execution travels through native mesh, domain, core, adapter, and deferred semantic vessels;
 * Awtsmoos.com keeps every extension and cache boundary explicit so power expands without hidden mutation or competing levels.
 */

import { compileProceduralBatch } from '../compiler/compileProceduralBatch.js';
import { applyProceduralLanguagePatch } from '../patch/applyProceduralLanguagePatch.js';
import { registerProceduralLanguagePlugin } from '../plugin/registerProceduralLanguagePlugin.js';
import { resolveSemanticReference } from '../reference/resolveSemanticReference.js';

/**
 * Runtime execution and extension facade over shared procedural-language authorities.
 * @class
 */
export class ProceduralExecutionApi {
	/**
	 * @param {object} authorities Shared compiler, registries, and cache assembled by the public authority factory.
	 */
	constructor(authorities) {
		this.compiler = authorities.compiler;
		this.registry = authorities.registry;
		this.resolverRegistry = authorities.resolverRegistry;
		this.generatorRegistry = authorities.generatorRegistry;
		this.domainRegistry = authorities.domainRegistry;
		this.cache = authorities.cache;
	}

	/** Returns a validated deterministic compile plan without executing geometry or adapters. */
	plan(input, options = {}) {
		return this.compiler.plan(input, options);
	}

	/** Compiles one JS or JSON procedural definition through registered execution authorities. */
	compile(input, options = {}) {
		return this.compiler.compile(input, options);
	}

	/** Compiles many definitions in stable order with bounded concurrency and optional deduplication. */
	compileMany(inputs = [], options = {}) {
		return compileProceduralBatch(inputs, this.compiler, options);
	}

	/** Applies portable set, merge, append, or remove patches and returns a new canonical definition. */
	patch(input, patches = []) {
		return applyProceduralLanguagePatch(input, patches);
	}

	/** Resolves a semantic reference through the shared namespaced resolver registry. */
	resolve(reference, context = {}) {
		return resolveSemanticReference(reference, this.resolverRegistry, context);
	}

	/** Registers a namespaced plugin without silently overwriting stable operations. */
	use(plugin, options = {}) {
		return registerProceduralLanguagePlugin(plugin, {
			languageRegistry: this.registry,
			resolverRegistry: this.resolverRegistry,
			override: options.override === true
		});
	}

	/** Registers a deterministic named definition generator. */
	registerGenerator(id, generator, options = {}) {
		this.generatorRegistry.register(id, generator, options);
		return this;
	}

	/** Registers an optional domain-specific generate/compile/resolve authority. */
	registerDomain(kind, authority, options = {}) {
		this.domainRegistry.register(kind, authority, options);
		return this;
	}

	/** Returns bounded cache hit, miss, eviction, and entry evidence. */
	cacheStats() {
		return this.cache.stats();
	}

	/** Clears one cache key or all cached artifacts when no key is supplied. */
	clearCache(key) {
		return this.cache.clear(key);
	}
}
