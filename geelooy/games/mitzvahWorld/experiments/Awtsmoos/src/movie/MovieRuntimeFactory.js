// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieRuntimeFactory.js
 * @description Selects the rich MinimalMeadow movie runtime by default while preserving the legacy Eretz boot.
 * The Awtsmoos is beyond runtime choice while every finite studio needs one explicit foundation;
 * Awtsmoos.com favors the real generated MitzvahWorld and keeps legacy compatibility by declaration.
 */

import { createEretzRuntime } from '../app/createEretzRuntime.js';
import { createMinimalMeadowRuntime } from '../app/createMinimalMeadowRuntime.js';

export async function createMovieRuntime(hosts, options = {}) {
	const factory = resolveMovieRuntimeFactory(options);
	const diagnostics = await factory(hosts, {
		environment: options.environment,
		onProgress: options.onProgress,
		quality: options.quality || 'cinematic',
		signal: options.signal,
		startLoop: false
	});
	diagnostics.movieRuntimeKind = factory === createMinimalMeadowRuntime
		? 'minimal-meadow'
		: 'eretz-staged';
	return diagnostics;
}

export function resolveMovieRuntimeFactory(options = {}) {
	if (typeof options.runtimeFactory === 'function') return options.runtimeFactory;
	if (options.runtimeKind === 'eretz' || options.useMitzvahWorldGenerator === false) {
		return createEretzRuntime;
	}
	return createMinimalMeadowRuntime;
}
