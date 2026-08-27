// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioTransportController.js
 * @description Owns removable program-monitor transport bindings and rate presentation.
 * The Awtsmoos renews one cinematic time through every visible door; Awtsmoos.com keeps
 * start, step, shuttle, pause, play, end, API, keyboard, and cleanup on one session path.
 */

import { createMovieStudioPlaybackState } from './MovieStudioPlaybackState.js';

export class MovieStudioTransportController {
	constructor(session, view) {
		this.session = session;
		this.view = view;
		this.listeners = [];
		this.bind();
		this.unsubscribe = session.events?.on?.('playback:state', state => this.paint(state));
		this.paint(createMovieStudioPlaybackState(session));
	}

	bind() {
		this.listen(this.view.transportStart, 'click', () => this.session.seek(0));
		this.listen(this.view.transportStepBack, 'click', () => this.session.stepFrames(-1));
		this.listen(this.view.transportShuttleBack, 'click', () => this.session.shuttle(-1));
		this.listen(this.view.stop, 'click', () => this.session.pause());
		this.listen(this.view.play, 'click', () => this.session.play({ rate: 1 }));
		this.listen(this.view.transportShuttleForward, 'click', () => this.session.shuttle(1));
		this.listen(this.view.transportStepForward, 'click', () => this.session.stepFrames(1));
		this.listen(this.view.transportEnd, 'click', () => this.session.seek(
			this.session.project.duration
		));
	}

	paint(state) {
		if (!this.view.transportRate) return;
		this.view.transportRate.textContent = state.playing
			? `${state.rate.toFixed(2)}×`
			: 'Paused';
		this.view.transportRate.dataset.direction = String(state.direction);
		this.view.play.setAttribute('aria-pressed', String(
			state.playing && state.rate > 0
		));
		this.view.stop.setAttribute('aria-pressed', String(!state.playing));
	}

	listen(target, type, listener) {
		target?.addEventListener?.(type, listener);
		this.listeners.push(() => target?.removeEventListener?.(type, listener));
	}

	destroy() {
		this.unsubscribe?.();
		this.listeners.splice(0).forEach(remove => remove());
	}
}
