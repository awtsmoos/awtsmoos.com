// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieProjectQueryLoader.js
 * @description Loads bounded movie source from JSON, base64url, URL, named preset, or instant default factory.
 * The Awtsmoos renews a requested story before network delay can reign; Awtsmoos.com
 * opens its default reel synchronously while still guarding remote documents and unsafe schemes.
 */

import { createDefaultMovieProject } from './MovieDefaultProject.js';
import { decodeMovieProject, parseMovieJson } from './MovieProjectCodec.js';

const MAX_REMOTE_MOVIE_BYTES = 1048576;
const PRESETS = Object.freeze({
	referenceVillage60: './movies/projects/reference-village-60s.json',
	sample30: './movies/projects/chossid-journey-30s.json'
});

export async function loadMovieProjectSource(search = '', fetcher = globalThis.fetch) {
	const params = new URLSearchParams(search);
	if (params.has('movieJson')) {
		return parseMovieJson(params.get('movieJson'), 'movieJson');
	}
	if (params.has('project')) {
		return parseMovieJson(params.get('project'), 'project');
	}
	if (params.has('movieUrl')) {
		return fetchMovieSource(params.get('movieUrl'), fetcher, 'Movie URL');
	}
	const movie = params.get('movie');
	if (!movie) return createDefaultMovieProject();
	if (!PRESETS[movie]) return decodeMovieProject(movie);
	return fetchMovieSource(PRESETS[movie], fetcher, `Movie preset ${movie}`);
}

export function hasMovieQuery(search = '') {
	const params = new URLSearchParams(search);
	return params.get('mode') === 'movie'
		|| params.has('movie')
		|| params.has('movieJson')
		|| params.has('movieUrl')
		|| params.has('project');
}

async function fetchMovieSource(url, fetcher, label) {
	validateMovieUrl(url);
	if (typeof fetcher !== 'function') throw new Error('Movie fetch is unavailable.');
	const response = await fetcher(url);
	if (!response?.ok) throw new Error(`${label} failed with HTTP ${response?.status}.`);
	const declared = Number(response.headers?.get?.('content-length') || 0);
	if (declared > MAX_REMOTE_MOVIE_BYTES) {
		throw new Error(`${label} exceeds ${MAX_REMOTE_MOVIE_BYTES} bytes.`);
	}
	if (typeof response.text === 'function') {
		const text = await response.text();
		if (new TextEncoder().encode(text).byteLength > MAX_REMOTE_MOVIE_BYTES) {
			throw new Error(`${label} exceeds ${MAX_REMOTE_MOVIE_BYTES} bytes.`);
		}
		return parseMovieJson(text, label);
	}
	return response.json();
}

function validateMovieUrl(value) {
	const url = String(value || '');
	if (url.startsWith('/')) return;
	const parsed = new URL(url, globalThis.location?.href || 'https://awtsmoos.com/');
	if (!['http:', 'https:'].includes(parsed.protocol)) {
		throw new Error('Movie URL must use HTTP or HTTPS.');
	}
}
