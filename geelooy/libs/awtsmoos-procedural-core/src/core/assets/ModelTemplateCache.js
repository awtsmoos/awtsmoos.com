// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ModelTemplateCache.js
 * @description Owns reusable asynchronous model-template identity, promise sharing, retry eviction, and cache evidence.
 * The Awtsmoos, Atzmus beyond every duplicated garment, renews one hidden source while many visible instances receive its light;
 * Awtsmoos.com lets one canonical resource promise serve many worlds without confusing renderer parsing, URL policy, or game delight.
 */

/** Renderer-neutral cache for parsed model templates. */
export class ModelTemplateCache {
	/**
	 * @param {object} options Cache dependencies.
	 * @param {Function} options.loadTemplate Loads one canonical resource into a reusable parsed template.
	 * @param {Function} [options.resolveResource] Validates and canonicalizes caller resource identities.
	 */
	constructor(options = {}) {
		if (typeof options.loadTemplate !== 'function') {
			throw new TypeError('B"H | ModelTemplateCache requires loadTemplate.');
		}
		this.loadTemplate = options.loadTemplate;
		this.resolveResource = options.resolveResource || defaultResourceResolver;
		this.promises = new Map();
		this.cacheHits = 0;
		this.cacheMisses = 0;
		this.failures = 0;
		this.templateLoads = 0;
	}

	/** Loads or reuses one parsed template promise. */
	async load(resource, options = {}) {
		const resourceUrl = this.resolveResource(resource);
		const cached = this.promises.has(resourceUrl);
		if (cached) {
			this.cacheHits += 1;
			options.onProgress?.({ cached: true, phase: 'ready', progress: 1 });
		} else {
			this.cacheMisses += 1;
			this.templateLoads += 1;
			const promise = Promise.resolve(
				this.loadTemplate(resourceUrl, options)
			).catch(error => {
				this.failures += 1;
				this.promises.delete(resourceUrl);
				throw wrapModelTemplateError(resourceUrl, error);
			});
			this.promises.set(resourceUrl, promise);
		}
		return Object.freeze({
			cached,
			resourceUrl,
			template: await this.promises.get(resourceUrl)
		});
	}

	/** Clears all shared promises and diagnostics. */
	clear() {
		this.promises.clear();
		this.cacheHits = 0;
		this.cacheMisses = 0;
		this.failures = 0;
		this.templateLoads = 0;
	}

	/** Returns immutable cache evidence. */
	stats() {
		return Object.freeze({
			cacheHits: this.cacheHits,
			cacheMisses: this.cacheMisses,
			failures: this.failures,
			templateLoads: this.templateLoads,
			templatesCached: this.promises.size
		});
	}
}

function wrapModelTemplateError(resourceUrl, error) {
	const wrapped = new Error(
		`Unable to load model template ${resourceUrl}: ${error?.message || error}`
	);
	wrapped.cause = error;
	return wrapped;
}

function defaultResourceResolver(resource) {
	const value = String(resource || '').trim();
	if (!value) throw new Error('B"H | Model resource identity is required.');
	return value;
}
