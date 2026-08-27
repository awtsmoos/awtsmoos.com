// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSceneWorldIdentity.js
 * @description Preserves legacy string worlds while exposing canonical object-world identity and context.
 * The Awtsmoos is beyond string and specification while both finite forms may point toward one revealed place;
 * Awtsmoos.com keeps events, loaders, retries, and frame snapshots stable across the compatibility space.
 */

import { compileMovieWorldPrompt } from './MovieWorldPromptCompiler.js';
import {
	isMovieWorldSpec,
	normalizeMovieWorldSpec
} from './MovieWorldSpec.js';

export function movieSceneWorldRequest(value, context = {}) {
	if (value == null || value === '') return null;
	if (typeof value === 'string') {
		return {
			identity: value,
			legacy: true,
			spec: context.compileLegacy === true
				? compileMovieWorldPrompt(value, context)
				: null,
			value
		};
	}
	const spec = isMovieWorldSpec(value)
		? normalizeMovieWorldSpec(value)
		: compileMovieWorldPrompt(value.prompt || value.label || value.id, {
			...context,
			...value
		});
	return {
		identity: spec.id,
		legacy: false,
		spec,
		value: spec
	};
}

export function movieSceneWorldSnapshot(value) {
	const request = movieSceneWorldRequest(value);
	if (!request) return null;
	return request.legacy ? request.identity : request.spec;
}
