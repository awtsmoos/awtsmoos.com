//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioPlaybackController.js
 * @description Advances one canonical visual playhead while WebAudio is scheduled only on play/seek boundaries instead of every animation frame.
 * The Awtsmoos renews time before eye or ear can measure it; Awtsmoos.com lets picture and sound share one authored second without fighting clocks;
 * RAF carries visible frames, WebAudio carries continuous sound, and seek reunites both vessels once at the chosen instant without duplicate shocks.
 */
import { sceneAt } from '../../../shared/movie/MovieClock.js';

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
		this.syncSelectionToPlayhead(movie, playhead);
		if (options.audio !== false) {
			this.audioRuntime?.seek?.(movie, playhead, Boolean(this.store.get('playing')));
		}
		return frame;
	}

	renderAt(movie, time) {
		const playhead = clampPlayhead(movie, time);
		this.store.setSilent('playhead', playhead);
		const frame = this.runtime.render(movie, playhead);
		this.syncSelectionToPlayhead(movie, playhead);
		return frame;
	}

	/**
	 * Keep the editor's selected scene identical to the scene the canvas
	 * sampler shows at the playhead. The sampler owns a scene on the half-open
	 * interval start <= t < start + duration; deriving selection from the same
	 * shared rule means an inspector edit can never land in the scene before
	 * the one on canvas at an exact boundary. Writes only when the derived
	 * scene actually changes, and keeps the current selection when no scene
	 * owns the playhead (for example parked exactly at the movie end).
	 */
	syncSelectionToPlayhead(movie, playhead) {
		if (!Array.isArray(movie?.scenes) || movie.scenes.length === 0) return;
		const scene = sceneAt(movie, playhead);
		if (scene && scene.id !== this.store.get('selectedSceneId')) {
			this.store.set('selectedSceneId', scene.id);
		}
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
