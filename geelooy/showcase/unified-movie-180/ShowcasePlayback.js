//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShowcasePlayback.js
 * @description Seconds flow through a finite clock while the Awtsmoos renews every cinematic instant from nothing;
 * Awtsmoos.com keeps playback simple and deterministic, so the proof may pause, seek, resume, and keep becoming.
 */

/**
 * @description Owns requestAnimationFrame playback time for the 180-second proof movie.
 */
export class ShowcasePlayback {
	/**
	 * @description Creates a playback clock bounded by the supplied movie duration.
	 * @param {{duration:number,onTime:function(number):void}} options - Playback duration and time observer.
	 * @returns {ShowcasePlayback} Playback clock instance.
	 * @throws {TypeError} When onTime is not callable.
	 * @sideEffects Stores callback state but does not start playback.
	 */
	constructor({ duration, onTime }) {
		if (typeof onTime !== "function") {
			throw new TypeError("ShowcasePlayback requires an onTime callback.");
		}
		this.duration = Math.max(0, Number(duration) || 0);
		this.onTime = onTime;
		this.time = 0;
		this.playing = false;
		this.startedAt = 0;
		this.frameId = null;
		this.tick = this.tick.bind(this);
	}

	/**
	 * @description Begins or resumes playback from the current time.
	 * @returns {void}
	 * @sideEffects Schedules requestAnimationFrame callbacks.
	 */
	play() {
		if (this.playing) {
			return;
		}
		if (this.time >= this.duration) {
			this.time = 0;
		}
		this.playing = true;
		this.startedAt = performance.now() - (this.time * 1000);
		this.frameId = requestAnimationFrame(this.tick);
	}

	/**
	 * @description Pauses playback without changing the current movie time.
	 * @returns {void}
	 * @sideEffects Cancels the pending animation frame when one exists.
	 */
	pause() {
		this.playing = false;
		if (this.frameId != null) {
			cancelAnimationFrame(this.frameId);
			this.frameId = null;
		}
	}

	/**
	 * @description Seeks to one bounded absolute movie time.
	 * @param {number} time - Requested absolute movie time in seconds.
	 * @returns {number} Bounded resolved movie time.
	 * @sideEffects Updates playback state and notifies the time observer.
	 */
	seek(time) {
		const finiteTime = Number.isFinite(Number(time)) ? Number(time) : 0;
		this.time = Math.max(0, Math.min(this.duration, finiteTime));
		if (this.playing) {
			this.startedAt = performance.now() - (this.time * 1000);
		}
		this.onTime(this.time);
		return this.time;
	}

	/**
	 * @description Toggles playback and returns the resulting playing state.
	 * @returns {boolean} True when playback is running after the toggle.
	 * @sideEffects Starts or pauses animation-frame scheduling.
	 */
	toggle() {
		if (this.playing) {
			this.pause();
		} else {
			this.play();
		}
		return this.playing;
	}

	/**
	 * @description Advances the playback clock from one animation-frame timestamp.
	 * @param {number} timestamp - DOMHighResTimeStamp from requestAnimationFrame.
	 * @returns {void}
	 * @sideEffects Updates time, notifies the observer, and schedules the next frame while active.
	 */
	tick(timestamp) {
		if (!this.playing) {
			return;
		}
		this.time = Math.min(this.duration, (timestamp - this.startedAt) / 1000);
		this.onTime(this.time);
		if (this.time >= this.duration) {
			this.pause();
			return;
		}
		this.frameId = requestAnimationFrame(this.tick);
	}
}
