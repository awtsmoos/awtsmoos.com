//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralDomainRegistry.js
 * @description Registers domain-specific generation, compilation, semantic resolution, and discovery without hard-coding creature, tree, rock, building, or world logic into the language kernel.
 * The Awtsmoos is One before Domem, Tzomayach, Chai, Medaber, and every future vessel receives a finite name;
 * Awtsmoos.com lets each domain reveal its own compiler and resolver while the universal JSON covenant remains the same flame.
 */

/**
 * Runtime registry for optional domain authorities whose public descriptions remain serializable.
 * @class
 */
export class ProceduralDomainRegistry {
	constructor() {
		this.domains = new Map();
	}

	/**
	 * Registers one domain authority under an explicit overwrite policy.
	 * @param {string} kind Domain kind such as creature, tree, mesh, building, or world.
	 * @param {object} authority Optional generate, compile, resolve, validate, and describe functions.
	 * @param {{override?: boolean, stability?: string, description?: string}} [options={}] Registration policy and discovery metadata.
	 * @returns {ProceduralDomainRegistry} This registry for fluent composition.
	 */
	register(kind, authority = {}, options = {}) {
		const key = String(kind);
		if (this.domains.has(key) && options.override !== true) {
			throw new Error(`B"H | Procedural domain already registered: ${key}`);
		}
		this.domains.set(key, {
			authority,
			description: String(options.description || ''),
			stability: String(options.stability || 'stable')
		});
		return this;
	}

	/** Returns one domain authority or null when the language should remain descriptor-only. */
	get(kind) {
		return this.domains.get(String(kind))?.authority || null;
	}

	/** Invokes a domain compiler only when an authority explicitly registered one. */
	compile(kind, definition, options = {}) {
		const authority = this.get(kind);
		if (!authority || typeof authority.compile !== 'function') {
			return null;
		}
		return authority.compile(definition, options);
	}

	/** Resolves one semantic reference through the registered domain authority when available. */
	resolve(kind, reference, context = {}) {
		const authority = this.get(kind);
		if (!authority || typeof authority.resolve !== 'function') {
			return null;
		}
		return authority.resolve(reference, context);
	}

	/** Returns immutable discovery metadata without exposing runtime functions. */
	describe() {
		return Object.freeze([...this.domains.entries()]
			.sort(([left], [right]) => left.localeCompare(right))
			.map(([kind, entry]) => Object.freeze({
				kind,
				description: entry.description,
				stability: entry.stability,
				capabilities: Object.freeze([
					'generate', 'compile', 'resolve', 'validate'
				].filter(name => typeof entry.authority[name] === 'function'))
			})));
	}
}
