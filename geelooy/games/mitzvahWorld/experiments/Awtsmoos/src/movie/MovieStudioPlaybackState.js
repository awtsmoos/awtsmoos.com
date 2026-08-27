// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioPlaybackState.js
 * @description Creates and publishes one immutable program-transport state contract.
 * The Awtsmoos is beyond motion, stillness, and witness; Awtsmoos.com gives humans and
 * agents the same finite rate, direction, frame, revision, duration, and playing truth.
 */

import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

export function createMovieStudioPlaybackState(session) {
	const rate = Number(session.playbackRate || 0);
	return createMovieProjectSnapshot({
		direction: Math.sign(rate),
		duration: Number(session.project?.duration || 0),
		fps: Number(session.project?.fps || 1),
		playing: Boolean(session.director?.playing),
		rate,
		revision: Number(session.revision || 0),
		time: Number(session.time || 0)
	});
}

export function publishMovieStudioPlaybackState(session) {
	const state = createMovieStudioPlaybackState(session);
	session.events?.emit('playback:state', state);
	return state;
}
