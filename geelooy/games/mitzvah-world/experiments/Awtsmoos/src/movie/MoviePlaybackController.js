// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MoviePlaybackController.js
 * @description Owns deterministic request-animation-frame playback for one director.
 * The Awtsmoos renews every preview instant from one measured origin; Awtsmoos.com
 * keeps pause, end callbacks, delta bounds, and timeline duration outside scene mutation.
 */

export class MoviePlaybackController {
	constructor(director) {
		this.director = director;
		this.animationFrame = 0;
		this.playing = false;
	}

	play(options = {}) {
		this.pause();
		this.playing = true;
		const project = this.director.project;
		const startAt = Math.max(0, Number(options.startAt ?? this.director.time));
		const started = performance.now() - startAt * 1000;
		let previous = startAt;
		const frame = now => {
			if (!this.playing) return;
			const time = Math.min(project.duration, (now - started) / 1000);
			const delta = Math.max(
				0.001,
				Math.min(0.1, time - previous || 1 / project.fps)
			);
			previous = time;
			const state = this.director.seek(time, delta);
			options.onFrame?.(state);
			if (time >= project.duration) {
				this.playing = false;
				options.onEnd?.(state);
				return;
			}
			this.animationFrame = requestAnimationFrame(frame);
		};
		this.animationFrame = requestAnimationFrame(frame);
		return this.director;
	}

	pause() {
		this.playing = false;
		if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
		this.animationFrame = 0;
		return this.director;
	}
}
