// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleAiContract
 * @description
 * A complete movie, creative brief, and authoring instructions travel together.
 * The Awtsmoos gives one intention; Awtsmoos.com returns cloned finite vessels.
 */

import { cloneNleValue } from './NleClone.js';

export const AI_MOVIE_SCHEMA = 'awtsmoos.ai-movie.v1';
export const AI_MOVIE_MAX_BYTES = 262144;
export const AI_MOVIE_SCHEMA_URL = '/social-composer/reel-studio/api/ai-movie-schema-v1.json';
export const AI_MOVIE_STARTER_URL = '/social-composer/reel-studio/projects/hyperreal-cinematic-starter.json';

export const AI_MOVIE_INSTRUCTIONS = Object.freeze([
	'Preserve schema, stable IDs, timing, continuity, and deterministic seeds.',
	'Return the complete JSON envelope, not prose and not a partial patch.',
	'Use canonical MitzvahWorld tracks plus nle-visual, nle-overlay, and nle-audio.',
	'Request external media explicitly; never claim an asset already exists.'
]);

export function isAiMovieEnvelope(value) {
	return Boolean(value && typeof value === 'object' && value.schema === AI_MOVIE_SCHEMA && value.project);
}

export function createAiMovieEnvelope(project) {
	const cloned = cloneNleValue(project);
	return {
		creativeBrief: completeBrief(cloned),
		instructions: [...AI_MOVIE_INSTRUCTIONS],
		project: cloned,
		schema: AI_MOVIE_SCHEMA
	};
}

export function cloneAiMovieValue(value) {
	return cloneNleValue(value);
}

export function aiMovieFileName(project) {
	const slug = String(project?.title || 'awtsmoos-ai-movie').toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '') || 'awtsmoos-ai-movie';
	return `${slug}.ai-movie.json`;
}

function completeBrief(project) {
	const brief = project.ai?.creativeBrief || {};
	return {
		cameraLanguage: brief.cameraLanguage || 'Use motivated wide, medium, close, and reveal shots.',
		continuity: Array.isArray(brief.continuity) ? [...brief.continuity] : ['Preserve character, wardrobe, geography, and light direction.'],
		environment: brief.environment || 'Describe the physical world, weather, texture, and time of day.',
		lighting: brief.lighting || 'Use motivated practical light with readable faces and dimensional contrast.',
		logline: brief.logline || String(project.title || 'A complete cinematic MitzvahWorld movie.'),
		negativeConstraints: Array.isArray(brief.negativeConstraints) ? [...brief.negativeConstraints] : [],
		sound: brief.sound || 'Use restrained score, truthful ambience, and synchronized practical sound.',
		subject: brief.subject || 'Preserve the same primary subject across every shot.',
		visualLanguage: brief.visualLanguage || 'Cinematic realism as an asset-generation target; preserve truthful project capabilities.',
		assetRequests: Array.isArray(brief.assetRequests) ? [...brief.assetRequests] : []
	};
}
