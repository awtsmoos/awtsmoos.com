//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioPlaybackController.js
 * Time is created anew by the Awtsmoos; this controller only measures the flowing sign;
 * Awtsmoos.com advances one canonical playhead without forcing the whole interface to redraw each time.
 */
export class StudioPlaybackController {
	constructor({ store, runtime, requestFrame, cancelFrame }) {
		this.store = store;
		this.runtime = runtime;
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
		if (Number(this.store.get('playhead')) >= movie.duration) this.seek(movie, 0);
		this.lastTimestamp = null;
		this.store.set('playing', true);
		this.frameRequest = this.requestFrame(this.tick);
	}

	pause(notify = true) {
		if (this.frameRequest !== null) this.cancelFrame(this.frameRequest);
		this.frameRequest = null;
		this.lastTimestamp = null;
		if (notify) this.store.set('playing', false);
		else this.store.setSilent('playing', false);
	}

	seek(movie, time) {
		const duration = Math.max(0, Number(movie?.duration || 0));
		const playhead = Math.min(duration, Math.max(0, Number(time || 0)));
		this.store.setSilent('playhead', playhead);
		return this.runtime.render(movie, playhead);
	}

	tick(timestamp) {
		if (!this.store.get('playing') || !this.movie) return;
		if (this.lastTimestamp === null) this.lastTimestamp = timestamp;
		const delta = Math.max(0, (timestamp - this.lastTimestamp) / 1000);
		this.lastTimestamp = timestamp;
		const next = Number(this.store.get('playhead') || 0) + delta;
		this.seek(this.movie, next);
		if (next >= this.movie.duration) {
			this.pause();
			return;
		}
		this.frameRequest = this.requestFrame(this.tick);
	}
}

function defaultRequestFrame(callback) {
	if (globalThis.requestAnimationFrame) return globalThis.requestAnimationFrame(callback);
	return globalThis.setTimeout(() => callback(Date.now()), 16);
}

function defaultCancelFrame(handle) {
	if (globalThis.cancelAnimationFrame) globalThis.cancelAnimationFrame(handle);
	else globalThis.clearTimeout(handle);
}
