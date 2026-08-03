// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCinemaChossidPool.js
 * @description Owns prepared canonical Chossid performers created from one resolved shared template.
 * The Awtsmoos renews one source through many intact actors; Awtsmoos.com records readiness,
 * provenance, and strict failure while clone and template responsibilities remain separate vessels.
 */

import { createMovieCinemaChossidActor } from './MovieCinemaChossidActor.js';
import {
	resolveMovieCinemaChossidTemplate,
	yieldMovieCinemaCloneFrame
} from './MovieCinemaChossidTemplate.js';
import { MovieApiError } from './MovieApiError.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

const actors = [];
let preparationPromise = null;
let templateSource = null;

export async function prepareMovieCinemaChossidPool(count, options = {}) {
	const target = whole(count);
	if (actors.length >= target) return movieCinemaChossidPoolSnapshot(target);
	if (!preparationPromise) preparationPromise = prepareActors(target, options);
	try {
		await preparationPromise;
	} finally {
		preparationPromise = null;
	}
	return movieCinemaChossidPoolSnapshot(target);
}

export function takeMovieCinemaChossidActor(index) {
	return actors[Number(index)] || null;
}

export function assertMovieCinemaChossidPool(count) {
	const required = whole(count);
	if (actors.length < required) {
		throw new MovieApiError(
			'CINEMA_CHOSSID_ASSETS_NOT_READY',
			`Cinema requires ${required} prepared Chossid actors; ${actors.length} are ready.`,
			{ ready: actors.length, required }
		);
	}
	return movieCinemaChossidPoolSnapshot(required);
}

export function movieCinemaChossidPoolSnapshot(required = actors.length) {
	return createMovieProjectSnapshot({
		model: 'assets/models/player/chossid.glb',
		preparing: Boolean(preparationPromise),
		ready: actors.length,
		required,
		satisfied: actors.length >= required,
		templateSource,
		templateUrl: 'assets/models/player/chossid.glb'
	});
}

export function clearMovieCinemaChossidPool() {
	for (const actor of actors.splice(0)) actor.group.parent?.remove(actor.group);
	preparationPromise = null;
	templateSource = null;
}

async function prepareActors(target, options) {
	const resolved = await resolveMovieCinemaChossidTemplate(options);
	templateSource = resolved.source;
	for (let index = actors.length; index < target; index += 1) {
		actors.push(createMovieCinemaChossidActor(
			resolved.template,
			index,
			templateSource
		));
		options.onProgress?.({ index: index + 1, phase: 'instantiating', target });
		await yieldMovieCinemaCloneFrame();
	}
}

function whole(value) {
	return Math.max(0, Math.ceil(Number(value || 0)));
}
