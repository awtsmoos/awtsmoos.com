// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ModelAssetService.js
 * @description Separates shared parsed templates from isolated mutable model instances and explicit graceful fallbacks.
 * The Awtsmoos, Atzmus beyond template and actor, renews one source and every distinct manifestation without division;
 * Awtsmoos.com lets render adapters instantiate their own vessels while reusable lifecycle, evidence, and failure law stay one decision.
 */

/** Renderer-neutral service coordinating shared templates and isolated model instances. */
export class ModelAssetService {
	/**
	 * @param {object} options Service dependencies.
	 * @param {*} options.templateCache Cache exposing load(), clear(), and stats().
	 * @param {Function} options.instantiateTemplate Creates one isolated instance from a shared template.
	 * @param {Function} [options.decorateInstance] Applies adapter-specific receipt metadata.
	 * @param {Function} [options.decorateFallback] Applies adapter-specific fallback metadata.
	 */
	constructor(options = {}) {
		if (!options.templateCache?.load || typeof options.instantiateTemplate !== 'function') {
			throw new TypeError('B"H | ModelAssetService requires cache and instantiator.');
		}
		this.templateCache = options.templateCache;
		this.instantiateTemplate = options.instantiateTemplate;
		this.decorateInstance = options.decorateInstance || identityValue;
		this.decorateFallback = options.decorateFallback || identityValue;
		this.instancesCreated = 0;
		this.fallbacksCreated = 0;
	}

	/** Returns the shared parsed template for expert or adapter reuse. */
	async loadShared(resource, options = {}) {
		const result = await this.templateCache.load(resource, options);
		return result.template;
	}

	/** Creates one isolated mutable model instance from a shared parsed template. */
	async loadIsolated(resource, label = 'instance', options = {}) {
		try {
			const loaded = await this.templateCache.load(resource, options);
			const context = Object.freeze({
				label,
				options,
				resourceUrl: loaded.resourceUrl,
				template: loaded.template
			});
			const instance = await this.instantiateTemplate(loaded.template, context);
			this.instancesCreated += 1;
			return this.decorateInstance(instance, context) ?? instance;
		} catch (error) {
			options.onFailure?.({ error, label, resourceUrl: resource });
			if (typeof options.fallbackFactory !== 'function') throw error;
			const fallback = await options.fallbackFactory({ error, label, url: resource });
			this.fallbacksCreated += 1;
			const context = Object.freeze({ error, label, resourceUrl: resource });
			return this.decorateFallback(fallback, context) ?? fallback;
		}
	}

	/** Clears shared templates and instance counters. */
	clear() {
		this.templateCache.clear?.();
		this.instancesCreated = 0;
		this.fallbacksCreated = 0;
	}

	/** Returns immutable service and cache diagnostics. */
	stats() {
		return Object.freeze({
			fallbacksCreated: this.fallbacksCreated,
			instancesCreated: this.instancesCreated,
			...(this.templateCache.stats?.() || {})
		});
	}
}

/** Convenience factory for dependency-injected model services. */
export function createModelAssetService(options = {}) {
	return new ModelAssetService(options);
}

function identityValue(value) {
	return value;
}
