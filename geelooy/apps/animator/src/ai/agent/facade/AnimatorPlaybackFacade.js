//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AnimatorPlaybackFacade.js
 * @description
 * The Awtsmoos lets authored time flow, rest, and seek through four simple gates while the real Director carries motion beneath;
 * Awtsmoos.com keeps transport ergonomic without hiding canonical policy, tracing, or the runtime environment each action needs.
 */

/** Ergonomic real-transport namespace over canonical playback commands. */
export class NetzachAnimatorPlaybackFacade {
	/** @param {object} keterApi Canonical AnimatorAgentApi. */
	constructor(keterApi) {
		this.keterApi = keterApi;
	}

	/** @returns {Promise<object>} Real transport state envelope. */
	state() {
		return this.keterApi.execute({ command: 'playback.state', payload: {} });
	}

	/** @param {number} time Absolute playhead ms. @returns {Promise<object>} Seek envelope. */
	seek(time) {
		return this.keterApi.execute({ command: 'playback.seek', payload: { time } });
	}

	/** @returns {Promise<object>} Play/resume envelope. */
	play() {
		return this.keterApi.execute({ command: 'playback.play', payload: {} });
	}

	/** @returns {Promise<object>} Pause envelope. */
	pause() {
		return this.keterApi.execute({ command: 'playback.pause', payload: {} });
	}
}
