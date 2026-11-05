// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSceneWorldIdentity.js
 * @description Preserves legacy string world IDs while normalizing object worlds as explicit JSON.
 * The Awtsmoos is beyond string and specification while both finite forms may identify one revealed place;
 * Awtsmoos.com keeps compatibility without assigning weather, trees, danger, or camera behavior from the words in a name.
 */

import { compileMovieWorldJson } from './MovieWorldJsonCompiler.js';
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
			spec: context.compileLegacy === true ? legacySpec(value, context) : null,
			value
		};
	}
	const spec = isMovieWorldSpec(value)
		? normalizeMovieWorldSpec(value)
		: compileMovieWorldJson(value, context);
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

function legacySpec(value, context) {
	return compileMovieWorldJson({
		id: value,
		label: context.label || value,
		regionId: value,
		seed: context.seed
	}, context);
}
