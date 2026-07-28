// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleMovieAgentRequest
 * @description
 * A real connected provider may receive one explicit request package; when no
 * provider exists, the same complete package is returned honestly for manual handoff.
 */

import { cloneNleValue } from './NleClone.js';

export function createMovieAgentRequest(project, prompt, options = {}) {
	return {
		constraints: {
			completeEnvelopeRequired: true,
			preserveStableIds: true,
			providerMustDeclareMissingAssets: true,
			returnFormat: 'awtsmoos.movie-package.v1'
		},
		currentProject: cloneNleValue(project),
		duration: Number(options.duration || project.duration || 24),
		format: 'awtsmoos.movie-request.v1',
		prompt: String(prompt || 'Improve this complete cinematic movie package.'),
		quality: String(options.quality || 'cinematic'),
		schemaUrls: {
			movie: '/social-composer/reel-studio/api/ai-movie-schema-v1.json',
			package: '/social-composer/reel-studio/api/movie-package-schema-v1.json'
		},
		version: 1
	};
}

export async function askMovieAgent(request, provider = globalThis.AwtsmoosMovieAgentProvider) {
	if (typeof provider !== 'function') {
		return { connected: false, request, status: 'provider-not-connected' };
	}
	const response = await provider(cloneNleValue(request));
	return { connected: true, response, status: 'provider-returned' };
}
