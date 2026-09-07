//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioPlaybackController.js
 * @description Advances one canonical visual playhead while WebAudio is scheduled only on play/seek boundaries instead of every animation frame.
 * The Awtsmoos renews time before eye or ear can measure it; Awtsmoos.com lets picture and sound share one authored second without fighting clocks;
 * RAF carries visible frames, WebAudio carries continuous sound, and seek reunites both vessels once at the chosen instant without duplicate shocks.
 */
export class StudioPlaybackController {
	constructor({ store, runtime, audioRuntime, requestFrame, cancelFrame }) {
		this.store = store;
		this.runtime = runtime;
		this.audioRuntime = audioRuntime || null;
		this.requestFrame = requestFrame || defaultRequestFrame;
		this.cancelFrame = cancelFrame || defaultCancelFrame;
		this.frameRequest = null;
		this.lastTimestamp = null;
		this.movie = null;
		this.tick = this.tick.bind(this);
	}

	toggle(movie) {
		if (this.store.get('playing')) this.pause();
		else this.play(movie);
	}

	play(movie) {
		this.movie = movie;
		if (!movie?.duration) return;
		let playhead = Number(this.store.get('playhead') || 0);
		if (playhead >= movie.duration) {
			playhead = 0;
			this.renderAt(movie, playhead);
		}
		this.lastTimestamp = null;
		this.store.set('playing', true);
		void this.audioRuntime?.play(movie, playhead);
		this.frameRequest = this.requestFrame(this.tick);
	}

	pause(notify = true) {
		if (this.frameRequest !== null) this.cancelFrame(this.frameRequest);
		this.frameRequest = null;
		this.lastTimestamp = null;
		this.audioRuntime?.stop?.();
		if (notify) this.store.set('playing', false);
		else this.store.setSilent('playing', false);
	}

	seek(movie, time, options = {}) {
		const playhead = clampPlayhead(movie, time);
		this.store.setSilent('playhead', playhead);
		const frame = this.runtime.render(movie, playhead);
		if (options.audio !== false) {
			this.audioRuntime?.seek?.(movie, playhead, Boolean(this.store.get('playing')));
		}
		return frame;
	}

	renderAt(movie, time) {
		const playhead = clampPlayhead(movie, time);
		this.store.setSilent('playhead', playhead);
		return this.runtime.render(movie, playhead);
	}

	tick(timestamp) {
		if (!this.store.get('playing') || !this.movie) return;
		if (this.lastTimestamp === null) this.lastTimestamp = timestamp;
		const delta = Math.max(0, (timestamp - this.lastTimestamp) / 1000);
		this.lastTimestamp = timestamp;
		const next = Number(this.store.get('playhead') || 0) + delta;
		this.renderAt(this.movie, next);
		if (next >= this.movie.duration) {
			this.pause();
			return;
		}
		this.frameRequest = this.requestFrame(this.tick);
	}
}

function clampPlayhead(movie, time) {
	const duration = Math.max(0, Number(movie?.duration || 0));
	return Math.min(duration, Math.max(0, Number(time || 0)));
}

function defaultRequestFrame(callback) {
	if (globalThis.requestAnimationFrame) return globalThis.requestAnimationFrame(callback);
	return globalThis.setTimeout(() => callback(Date.now()), 16);
}

function defaultCancelFrame(handle) {
	if (globalThis.cancelAnimationFrame) globalThis.cancelAnimationFrame(handle);
	else globalThis.clearTimeout(handle);
}
