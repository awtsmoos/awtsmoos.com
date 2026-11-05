// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioSession.js
 * @description Owns stable identity, canonical installation, professional transport, capture, and release.
 * The Awtsmoos renews every cut, speed, schema, memory, and extension beyond editor state;
 * Awtsmoos.com keeps one session while focused service vessels evolve independently.
 */

import { destroyMovieStudioSession } from './MovieStudioLifecycle.js';
import { installMovieStudioProject } from './MovieStudioProjectInstall.js';
import {
	copyMovieStudioUrl,
	renderMovieStudioSession
} from './MovieStudioSessionActions.js';
import { initializeMovieStudioSessionServices } from './MovieStudioSessionServices.js';
import {
	pauseMovieStudioSession,
	playMovieStudioSession,
	seekMovieStudioSession,
	setMovieStudioPlaybackRate,
	shuttleMovieStudioSession,
	stepMovieStudioSession,
	stopMovieStudioSession
} from './MovieStudioSessionTransport.js';

export class MovieStudioSession {
	constructor(runtime, diagnostics, view, source) {
		this.runtime = runtime;
		this.diagnostics = diagnostics;
		this.view = view;
		this.time = 0;
		this.playbackRate = 0;
		this.revision = 0;
		this.destroyed = false;
		initializeMovieStudioSessionServices(this);
		this.installProject(source, { reason: 'Initial movie project' });
	}

	installProject(source, options = {}) {
		const result = installMovieStudioProject(this, source, options);
		this.time = Math.min(this.time, this.project.duration);
		return result;
	}

	seek(time) {
		return seekMovieStudioSession(this, time);
	}

	play(options = {}) {
		return playMovieStudioSession(this, options);
	}

	pause() {
		return pauseMovieStudioSession(this);
	}

	stop() {
		return stopMovieStudioSession(this);
	}

	stepFrames(frames = 1) {
		return stepMovieStudioSession(this, frames);
	}

	shuttle(direction) {
		return shuttleMovieStudioSession(this, direction);
	}

	setPlaybackRate(rate) {
		return setMovieStudioPlaybackRate(this, rate);
	}

	render() {
		return renderMovieStudioSession(this);
	}

	copyUrl() {
		return copyMovieStudioUrl(this);
	}

	destroy() {
		return destroyMovieStudioSession(this);
	}
}
