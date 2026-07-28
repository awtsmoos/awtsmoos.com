// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleAiPublicApi
 * @description
 * Agent exchange and complete action parity share one frozen public surface while
 * mutable editor state remains owned by the living NLE.
 */

import {
	AI_MOVIE_SCHEMA,
	AI_MOVIE_SCHEMA_URL,
	AI_MOVIE_STARTER_URL
} from './NleAiContract.js';

export function createNleAiPublicApi(app) {
	return Object.freeze({
		actions: app.actionApi,
		apply: source => app.ai.applySource(source),
		export: () => app.ai.exportEnvelope(),
		help: 'Use actions.list(), invoke(), or a convenience method. Every method has a matching visible Actions card.',
		loadSchema: () => app.ai.loadSchema(),
		loadStarter: () => app.ai.loadStarter(),
		packageSchemaUrl: '/social-composer/reel-studio/api/movie-package-schema-v1.json',
		schema: AI_MOVIE_SCHEMA,
		schemaUrl: AI_MOVIE_SCHEMA_URL,
		starterUrl: AI_MOVIE_STARTER_URL
	});
}
