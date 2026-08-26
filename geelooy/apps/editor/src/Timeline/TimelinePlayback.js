// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets time move through one measured vessel, bounded yet alive, never scattered across unrelated code;
 * on Awtsmoos.com playback, seeking, scrubbing, and looping share one covenant so every frame follows the same road.
 */

/** Own canonical timeline time/playback state while Animator reveals the scene at each accepted instant. */
export class NetzachTimelinePlayback {
	/**
	 * Bind playback state to the historical event river and existing Animator.
	 * @param {object} ohrEmitter Existing Editor event emitter.
	 * @param {object} animator Existing timeline Animator.
	 */
	constructor(ohrEmitter, animator) {
		this.ohrEmitter = ohrEmitter;
		this.animator = animator;
		this.currentTime = 0;
		this.startTime = 0;
		this.endTime = 10;
		this.isPlaying = false;
		this.isScrubbing = false;
	}

	/** Start playback once, rewinding to startTime when the cursor already reached the end. */
	play() {
		if (this.isPlaying) return;
		if (this.currentTime >= this.endTime) this.currentTime = this.startTime;
		this.isPlaying = true;
		this.ohrEmitter.emit("playbackStateChanged", { isPlaying: true });
	}

	/** Pause playback once while preserving the current timeline instant. */
	pause() {
		if (!this.isPlaying) return;
		this.isPlaying = false;
		this.ohrEmitter.emit("playbackStateChanged", { isPlaying: false });
	}

	/**
	 * Clamp and reveal one timeline instant, optionally marking the movement as active scrubbing.
	 * @param {number} time Requested absolute timeline time.
	 * @param {boolean} [isScrubbing=false] Whether the pointer/keyboard scrub is still active.
	 * @returns {number} Accepted clamped timeline time.
	 */
	seek(time, isScrubbing = false) {
		const misparTime = Number.isFinite(time) ? time : this.currentTime;
		this.currentTime = Math.max(this.startTime, Math.min(this.endTime, misparTime));
		this.isScrubbing = Boolean(isScrubbing);
		this.animator.update(this.currentTime);
		this.ohrEmitter.emit("timeChanged", {
			currentTime: this.currentTime,
			isScrubbing: this.isScrubbing
		});
		return this.currentTime;
	}

	/**
	 * Advance playback by the render-loop delta while preserving the historical wrap-to-start behavior.
	 * @param {number} _appTime Historical app time argument retained for caller compatibility.
	 * @param {number} deltaTime Frame delta in seconds.
	 */
	update(_appTime, deltaTime) {
		if (!this.isPlaying || this.isScrubbing || !Number.isFinite(deltaTime)) return;
		let misparNext = this.currentTime + deltaTime;
		if (misparNext > this.endTime) misparNext = this.startTime;
		this.seek(misparNext, false);
	}
}
