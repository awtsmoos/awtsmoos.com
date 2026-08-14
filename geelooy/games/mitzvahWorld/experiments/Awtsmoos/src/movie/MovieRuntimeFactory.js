// B"H
// Boruch Hashem
// Blessed is He

/** Selects an explicit Movie runtime; the complete authored valley is the production default. */
import { createEretzRuntime } from '../app/createEretzRuntime.js';
import { createMinimalMeadowRuntime } from '../app/createMinimalMeadowRuntime.js';
import { createMovieAuthoredWorldRuntime } from './MovieAuthoredWorldRuntime.js';

export async function createMovieRuntime(hosts, options = {}) {
	const factory = resolveMovieRuntimeFactory(options);
	const diagnostics = await factory(hosts, {
		...options,
		environment: options.environment,
		quality: options.quality || 'cinematic',
		startLoop: false
	});
	diagnostics.movieRuntimeKind ||= runtimeName(factory);
	return diagnostics;
}

export function resolveMovieRuntimeFactory(options = {}) {
	if (typeof options.runtimeFactory === 'function') return options.runtimeFactory;
	if (options.runtimeKind === 'minimal-meadow') return createMinimalMeadowRuntime;
	if (options.runtimeKind === 'eretz-staged') return createEretzRuntime;
	return createMovieAuthoredWorldRuntime;
}

function runtimeName(factory) {
	if (factory === createMinimalMeadowRuntime) return 'minimal-meadow';
	if (factory === createEretzRuntime) return 'eretz-staged';
	return 'authored-eretz';
}
