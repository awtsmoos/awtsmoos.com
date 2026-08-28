//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralRegistryInspectionApi.js
 * @description Projects every shared procedural registry into serializable discovery data while executable compiler, resolver, generator, and domain functions remain private behind their authorities.
 * The Awtsmoos renews every hidden capability before Daas may describe what a finite registry can do;
 * Awtsmoos.com lets inspection reveal ids, channels, domains, resources, and promises while never handing the private executable flame through.
 */

export class ProceduralRegistryInspectionApi {
	/**
	 * @description Captures the frozen shared authority constellation for read-only registry discovery without modifying any registry or exposing private executor accessors.
	 * @param {object} [chochmahAuthorities={}] Shared operation, resolver, compiler, generator, domain, and resource registries.
	 */
	constructor(chochmahAuthorities = {}) {
		this.registry = chochmahAuthorities.registry || null;
		this.resolverRegistry = chochmahAuthorities.resolverRegistry || null;
		this.compilerRegistry = chochmahAuthorities.compilerRegistry || null;
		this.generatorRegistry = chochmahAuthorities.generatorRegistry || null;
		this.domainRegistry = chochmahAuthorities.domainRegistry || null;
		this.resourceRegistry = chochmahAuthorities.resourceRegistry || null;
	}

	/**
	 * @description Returns serializable semantic compiler capabilities sorted by the registry while intentionally omitting trusted private executor functions.
	 * @returns {ReadonlyArray<object>} Immutable compiler capability descriptors safe for editors, agents, docs, and remote inspection.
	 */
	compilers() {
		return this.compilerRegistry?.describe?.() || Object.freeze([]);
	}

	/**
	 * @description Returns one immutable discovery map spanning all shared registries so callers can understand the available language/runtime universe without probing implementation objects.
	 * @returns {Readonly<object>} Serializable operation, resolver, compiler, generator, domain, and resource discovery records.
	 */
	registries() {
		return Object.freeze({
			operations: this.registry?.describe?.() || Object.freeze([]),
			resolvers: this.resolverRegistry?.describe?.() || Object.freeze([]),
			compilers: this.compilers(),
			generators: this.generatorRegistry?.describe?.() || Object.freeze([]),
			domains: this.domainRegistry?.describe?.() || Object.freeze([]),
			resources: this.resourceRegistry?.describe?.() || Object.freeze([])
		});
	}
}
