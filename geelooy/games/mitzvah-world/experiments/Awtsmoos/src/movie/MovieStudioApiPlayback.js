// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiPlayback.js
 * @description Exposes seek, frame-step, shuttle, rate, play, pause, toggle, stop, and state.
 * The Awtsmoos renews motion and stillness without opposition; Awtsmoos.com lets agents
 * direct professional preview transport while every transition remains observable and finite.
 */

import { createMovieStudioPlaybackState } from './MovieStudioPlaybackState.js';
import { runMovieStudioApiOperation } from './MovieStudioApiOperation.js';

export function createMovieStudioPlaybackDomain(session) {
	return Object.freeze({
		pause: options => operation(session, 'pause', options, () => session.pause()),
		play: (payload = {}, options) => operation(
			session, 'play', options, () => session.play(payload)
		),
		seek: (time, options) => operation(
			session, 'seek', options, () => session.seek(time)
		),
		setRate: (rate, options) => operation(
			session, 'setRate', options, () => session.setPlaybackRate(rate)
		),
		shuttleLeft: options => operation(
			session, 'shuttleLeft', options, () => session.shuttle(-1)
		),
		shuttleRight: options => operation(
			session, 'shuttleRight', options, () => session.shuttle(1)
		),
		state: () => createMovieStudioPlaybackState(session),
		step: (frames = 1, options) => operation(
			session, 'step', options, () => session.stepFrames(frames)
		),
		stepBackward: (frames = 1, options) => operation(
			session, 'stepBackward', options, () => session.stepFrames(-Math.abs(frames))
		),
		stepForward: (frames = 1, options) => operation(
			session, 'stepForward', options, () => session.stepFrames(Math.abs(frames))
		),
		stop: options => operation(session, 'stop', options, () => session.stop()),
		toggle: options => operation(
			session,
			'toggle',
			options,
			() => session.director.playing ? session.pause() : session.play()
		)
	});
}

function operation(session, name, options, action) {
	return runMovieStudioApiOperation(
		session,
		`playback.${name}`,
		options,
		() => {
			action();
			return createMovieStudioPlaybackState(session);
		}
	);
}
