// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleAiProjectCodec
 * @description
 * Raw projects, AI envelopes, and complete movie packages pass through byte limits,
 * canonical normalization, strict validation, and NLE completion before state changes.
 */

import { normalizeMovieProject } from '../../../games/mitzvahWorld/experiments/Awtsmoos/src/movie/MovieProjectNormalizer.js';
import { validateMovieProject } from '../../../games/mitzvahWorld/experiments/Awtsmoos/src/movie/MovieProjectValidator.js';
import {
	AI_MOVIE_MAX_BYTES,
	AI_MOVIE_SCHEMA,
	AI_MOVIE_SCHEMA_URL,
	AI_MOVIE_STARTER_URL,
	cloneAiMovieValue,
	isAiMovieEnvelope
} from './NleAiContract.js';
import { validateMoviePackage } from './NleMoviePackage.js';
import { ensureNleProject } from './NleProjectDefaults.js';

export function decodeAiMovieSource(source) {
	const value = parseSource(source);
	const packageProject = value?.format === 'awtsmoos.movie-package.v1'
		? validateMoviePackage(value).package.project
		: null;
	const envelope = isAiMovieEnvelope(value) ? value : null;
	if (value?.schema && !envelope) throw new Error(`Unsupported AI movie schema: ${value.schema}`);
	const project = cloneAiMovieValue(packageProject || envelope?.project || value);
	if (!project || typeof project !== 'object' || Array.isArray(project)) {
		throw new Error('Movie JSON must contain a complete project object.');
	}
	if (envelope) {
		project.ai = {
			...(project.ai || {}),
			contract: AI_MOVIE_SCHEMA,
			creativeBrief: cloneAiMovieValue(envelope.creativeBrief || {})
		};
	}
	const normalized = normalizeMovieProject(project);
	validateMovieProject(normalized);
	validateNleEnvelope(normalized);
	return ensureNleProject(normalized);
}

export async function loadAiMovieDocument(url = AI_MOVIE_STARTER_URL, fetcher = globalThis.fetch) {
	const response = await fetcher(url, { credentials: 'same-origin' });
	if (!response.ok) throw new Error(`AI movie document failed to load (${response.status}).`);
	return decodeAiMovieSource(await response.json());
}

export async function loadAiMovieSchema(fetcher = globalThis.fetch) {
	const response = await fetcher(AI_MOVIE_SCHEMA_URL, { credentials: 'same-origin' });
	if (!response.ok) throw new Error(`AI movie schema failed to load (${response.status}).`);
	return response.json();
}

function parseSource(source) {
	if (typeof source !== 'string') return source;
	const bytes = new TextEncoder().encode(source).byteLength;
	if (bytes > AI_MOVIE_MAX_BYTES) throw new Error(`AI movie JSON exceeds ${AI_MOVIE_MAX_BYTES} bytes.`);
	try { return JSON.parse(source); }
	catch (error) { throw new Error(`AI movie JSON is invalid: ${error.message}`); }
}

function validateNleEnvelope(project) {
	const assets = project.nle?.assets || [];
	if (!Array.isArray(assets) || assets.length > 256) throw new Error('NLE assets must be an array of at most 256 items.');
	for (const asset of assets) {
		if (!asset?.id || !asset?.kind) throw new Error('Every NLE asset requires id and kind.');
	}
	const bytes = new TextEncoder().encode(JSON.stringify(project)).byteLength;
	if (bytes > AI_MOVIE_MAX_BYTES) throw new Error(`Normalized movie exceeds ${AI_MOVIE_MAX_BYTES} bytes.`);
}
