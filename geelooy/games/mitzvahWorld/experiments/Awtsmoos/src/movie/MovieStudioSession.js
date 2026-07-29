// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioSession.js
 * @description Owns stable identity, canonical installation, preview time, capture, and release.
 * The Awtsmoos renews every cut, schema, memory, and extension beyond editor state;
 * Awtsmoos.com keeps one session while focused service vessels evolve independently.
 */

import { destroyMovieStudioSession } from './MovieStudioLifecycle.js';
import { installMovieStudioProject } from './MovieStudioProjectInstall.js';
import {
	copyMovieStudioUrl,
	renderMovieStudioSession
} from './MovieStudioSessionActions.js';
import { initializeMovieStudioSessionServices } from './MovieStudioSessionServices.js';

export class MovieStudioSession {
	constructor(runtime, diagnostics, view, source) {
		this.runtime = runtime;
		this.diagnostics = diagnostics;
		this.view = view;
		this.time = 0;
		this.revision = 0;
		this.destroyed = false;
		initializeMovieStudioSessionServices(this);
		this.installProject(source, { reason: 'Initial movie project' });
	}

	installProject(source, options = {}) {
		return installMovieStudioProject(this, source, options);
	}

	seek(time) {
		this.time = Math.max(0, Math.min(
			this.project.duration,
			Number(time) || 0
		));
		const frame = this.director.seek(this.time);
		this.timeline?.setTime(frame.time);
		this.view.status.textContent = `${frame.time.toFixed(2)} / ${
			this.project.duration.toFixed(2)
		}s · ${frame.shot}`;
		this.events.emit('playback:time', {
			revision: this.revision,
			shot: frame.shot,
			time: frame.time
		});
		return frame;
	}

	play() {
		this.events.emit('playback:state', {
			playing: true,
			revision: this.revision,
			time: this.time
		});
		this.director.play({
			onEnd: () => this.onPlaybackEnd(),
			onFrame: frame => this.onPlaybackFrame(frame)
		});
	}

	onPlaybackEnd() {
		this.view.status.textContent = 'Preview complete.';
		this.events.emit('playback:state', {
			playing: false,
			revision: this.revision,
			time: this.time
		});
	}

	onPlaybackFrame(frame) {
		this.time = frame.time;
		this.timeline.setTime(frame.time);
		this.view.status.textContent = `Preview ${
			frame.time.toFixed(2)
		} / ${this.project.duration.toFixed(2)}s`;
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
