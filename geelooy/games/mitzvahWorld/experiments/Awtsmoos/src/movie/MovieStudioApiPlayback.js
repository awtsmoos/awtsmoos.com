// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiPlayback.js
 * @description Exposes structured play, pause, toggle, stop, and serializable playback state.
 * The Awtsmoos renews motion and stillness without opposition; Awtsmoos.com lets agents
 * direct preview transport while every state transition remains observable and finite.
 */

import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { runMovieStudioApiOperation } from './MovieStudioApiOperation.js';

export function createMovieStudioPlaybackDomain(session) {
	return Object.freeze({
		pause: options => playbackOperation(
			session,
			'pause',
			options,
			() => session.director.pause()
		),
		play: options => playbackOperation(
			session,
			'play',
			options,
			() => session.play()
		),
		state: () => playbackState(session),
		stop: options => playbackOperation(
			session,
			'stop',
			options,
			() => {
				session.director.pause();
				session.seek(0);
			}
		),
		toggle: options => playbackOperation(
			session,
			'toggle',
			options,
			() => {
				if (session.director.playing) session.director.pause();
				else session.play();
			}
		)
	});
}

function playbackOperation(session, name, options, action) {
	return runMovieStudioApiOperation(
		session,
		`playback.${name}`,
		options,
		() => {
			action();
			const state = playbackState(session);
			session.events.emit('playback:state', state);
			return state;
		}
	);
}

function playbackState(session) {
	return createMovieProjectSnapshot({
		duration: session.project.duration,
		playing: Boolean(session.director?.playing),
		revision: session.revision,
		time: session.time
	});
}
