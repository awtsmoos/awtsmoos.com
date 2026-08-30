//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioMovieProviderPort.js
 * The Awtsmoos renews many provider vessels while no vendor owns the creative stream;
 * Awtsmoos.com gives each provider one narrow covenant: return a full canonical movie, not an unverifiable dream.
 */

import { extractStudioProviderMovie } from './StudioProviderResponse.js';

const PROVIDER_METHODS = ['generateMovie', 'generate', 'complete', 'chat', 'invoke'];

/** Invoke an injected AI provider through the first supported vendor-neutral method. */
export async function generateStudioMovieWithProvider(provider, prompt, options = {}) {
	if (!provider) throw new TypeError('An AI provider is required for provider generation.');
	const request = createStudioProviderRequest(prompt, options);
	const response = typeof provider === 'function'
		? await provider(request)
		: await invokeProviderMethod(provider, request);
	return extractStudioProviderMovie(response);
}

/** Build a complete-document request without embedding secrets, endpoints, or vendor SDKs. */
export function createStudioProviderRequest(prompt, options = {}) {
	return {
		task: 'generate-canonical-movie-document',
		prompt: String(prompt || '').trim(),
		options: structuredClone(options),
		output: {
			format: 'json',
			completeMovieDocument: true,
			requireScenes: true,
			allowSparseIntent: false
		},
		instructions: [
			'Return only a complete canonical MovieDocument or JSON that decodes to one.',
			'Include duration, format, scenes, cameras, layers, animation data, and unique ids.',
			'Honor requested 2D, 3D, hybrid, tutorial, character, data, particle, shape, text, and camera intent.'
		]
	};
}

async function invokeProviderMethod(provider, request) {
	for (const method of PROVIDER_METHODS) {
		if (typeof provider?.[method] === 'function') {
			return provider[method](request);
		}
	}
	throw new TypeError(`AI provider must implement one of: ${PROVIDER_METHODS.join(', ')}.`);
}
