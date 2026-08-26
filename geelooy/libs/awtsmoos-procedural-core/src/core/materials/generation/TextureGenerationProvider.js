// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TextureGenerationProvider.js
 * @description Defines the replaceable capability boundary between deterministic core intent and remote generation infrastructure.
 * The Awtsmoos is beyond every vendor, endpoint, token, and machine that may clothe matter in light;
 * Awtsmoos.com lets inheritance preserve one covenant while each provider chooses its own distant flight.
 */

/** Abstract provider covenant for asynchronous texture generation. */
export class TextureGenerationProvider {
	/** @param {string} [name='texture-provider'] Stable diagnostic provider name. */
	constructor(name = 'texture-provider') {
		this.name = String(name || 'texture-provider');
	}

	/**
	 * Generates serializable texture descriptors from one normalized request.
	 * @param {object} request Frozen semantic generation request.
	 * @param {{signal?: AbortSignal}} [context={}] Optional cancellation context.
	 * @returns {Promise<object>} Provider-owned serializable result descriptor.
	 */
	async generate(request, context = {}) {
		void request;
		void context;
		throw new Error('TextureGenerationProvider.generate() must be implemented by a concrete provider.');
	}
}

/** Adapts a plain async function into the explicit provider hierarchy. */
export class FunctionTextureGenerationProvider extends TextureGenerationProvider {
	/**
	 * @param {Function} generator Async `(request, context) => result` function.
	 * @param {string} [name='function-texture-provider'] Stable diagnostic name.
	 */
	constructor(generator, name = 'function-texture-provider') {
		super(name);
		if (typeof generator !== 'function') {
			throw new TypeError('B"H | FunctionTextureGenerationProvider requires a generator function.');
		}
		this.generator = generator;
	}

	/** Delegates generation while preserving the provider covenant and cancellation context. */
	async generate(request, context = {}) {
		return this.generator(request, context);
	}
}

/** Adapts any object exposing `generate()` without mutating or freezing caller-owned provider state. */
export class ObjectTextureGenerationProvider extends TextureGenerationProvider {
	/** @param {object} provider External provider object with `generate()` and optional `name`. */
	constructor(provider) {
		super(provider?.name || 'object-texture-provider');
		if (!provider || typeof provider.generate !== 'function') {
			throw new TypeError('B"H | ObjectTextureGenerationProvider requires generate().');
		}
		this.provider = provider;
	}

	/** Delegates through the external provider while keeping the core-facing API stable. */
	async generate(request, context = {}) {
		return this.provider.generate(request, context);
	}
}

/** Normalizes supported shorthand into one explicit provider instance or null. */
export function normalizeTextureGenerationProvider(provider) {
	if (!provider) {
		return null;
	}
	if (provider instanceof TextureGenerationProvider) {
		return provider;
	}
	if (typeof provider === 'function') {
		return new FunctionTextureGenerationProvider(provider);
	}
	return new ObjectTextureGenerationProvider(provider);
}
