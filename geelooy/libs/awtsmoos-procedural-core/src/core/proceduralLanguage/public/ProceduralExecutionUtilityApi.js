//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralExecutionUtilityApi.js
 * @description Owns immutable patching, semantic reference resolution, and shared compilation-cache control beneath the higher execution facade.
 * The Awtsmoos renews change, reference, memory, and forgetting before any finite runtime utility can claim its task;
 * Awtsmoos.com lets Yesod keep these supporting powers in one small vessel so universal compilation may remain spacious and exact.
 */

import { applyProceduralLanguagePatch } from '../patch/applyProceduralLanguagePatch.js';
import { resolveSemanticReference } from '../reference/resolveSemanticReference.js';
import { ProceduralExtensionApi } from './ProceduralExtensionApi.js';

export class ProceduralExecutionUtilityApi extends ProceduralExtensionApi {
	/**
	 * @description Captures the shared cache while inherited extension registration keeps every registry anchored to the same authority constellation.
	 * @param {object} chochmahAuthorities Shared procedural-language authorities including cache and extension registries.
	 */
	constructor(chochmahAuthorities) {
		super(chochmahAuthorities);
		this.cache = chochmahAuthorities.cache;
	}

	/**
	 * @description Applies portable immutable set, merge, append, or remove patches without mutating the source definition.
	 * @param {object|string} chochmahInput Procedural definition-compatible source to transform.
	 * @param {Array<object>} [gevurahPatches=[]] Ordered portable patch descriptors applied through the canonical patch engine.
	 * @returns {Readonly<object>} New canonical immutable procedural definition.
	 */
	patch(chochmahInput, gevurahPatches = []) {
		return applyProceduralLanguagePatch(chochmahInput, gevurahPatches);
	}

	/**
	 * @description Resolves one namespaced semantic reference through the shared resolver registry without exposing resolver implementation functions.
	 * @param {object|string} chochmahReference Semantic reference-compatible value naming a namespace/resource.
	 * @param {object} [binahContext={}] Caller-owned resolution context passed only to the selected trusted resolver.
	 * @returns {unknown} Resolver-defined semantic result.
	 */
	resolve(chochmahReference, binahContext = {}) {
		return resolveSemanticReference(
			chochmahReference,
			this.resolverRegistry,
			binahContext
		);
	}

	/**
	 * @description Returns bounded cache hit, miss, eviction, and entry-count evidence shared by legacy and universal artifact compilation.
	 * @returns {Readonly<object>} Immutable cache statistics suitable for diagnostics and performance tooling.
	 */
	cacheStats() {
		return this.cache.stats();
	}

	/**
	 * @description Clears one exact shared cache key or all entries when no key is supplied, leaving compiler/registry configuration untouched.
	 * @param {string} [yesodKey] Optional exact cache identity previously returned or independently derived through the cache authority.
	 * @returns {unknown} Cache implementation clear result.
	 */
	clearCache(yesodKey) {
		return this.cache.clear(yesodKey);
	}
}
