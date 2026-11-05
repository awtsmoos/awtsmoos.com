// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCinemaAssetPreparation.js
 * @description Prepares and verifies all canonical final-human assets before project installation or exact frame zero.
 * The Awtsmoos renews readiness before visible motion; Awtsmoos.com refuses a cinematic
 * human fallback when the immutable Chossid garment has not completed its isolated preparation.
 */

import {
	assertMovieCinemaChossidPool,
	movieCinemaChossidPoolSnapshot,
	prepareMovieCinemaChossidPool
} from './MovieCinemaChossidPool.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export async function prepareMovieCinemaAssets(manifest, options = {}) {
	const requiredChossidActors = countChossidActors(manifest);
	const chossid = await prepareMovieCinemaChossidPool(requiredChossidActors, options);
	return createMovieProjectSnapshot({
		chossid,
		ready: chossid.satisfied,
		requiredChossidActors
	});
}

export function assertMovieCinemaAssetsReady(manifest) {
	const requiredChossidActors = countChossidActors(manifest);
	const chossid = assertMovieCinemaChossidPool(requiredChossidActors);
	return createMovieProjectSnapshot({
		chossid,
		ready: true,
		requiredChossidActors
	});
}

export function movieCinemaAssetStatus(manifest) {
	const requiredChossidActors = countChossidActors(manifest);
	const chossid = movieCinemaChossidPoolSnapshot(requiredChossidActors);
	return createMovieProjectSnapshot({
		chossid,
		ready: chossid.satisfied,
		requiredChossidActors
	});
}

function countChossidActors(manifest) {
	return (manifest?.characters || []).filter(character => character.source === 'friendlyNpc').length;
}
