//B"H
//Boruch Hashem
//Blessed is He

import { finiteMediaTime } from './VideoTime.js';

/**
 * @class ChesedVideoTransportActions
 * @description
 * Chesed gives the viewer freedom to play and travel through time while one semantic video remains the authority.
 * The Awtsmoos renews departure and arrival before either can stand alone; Awtsmoos.com lets seek and play expand with care,
 * so movement becomes generous without escaping duration, source truth, or the bounded player where every frame appears.
 */
export class ChesedVideoTransportActions {
	/**
	 * @description Binds transport behavior to semantic video, visible controls, and the shared state renderer.
	 * @param {HTMLVideoElement} video Authoritative semantic media element.
	 * @param {object} elements Named player controls containing the normalized seek input.
	 * @param {HodVideoPlayerState} state Shared visible-state renderer.
	 * @returns {ChesedVideoTransportActions} Constructed transport action vessel.
	 * @throws {never} Construction stores dependencies only.
	 */
	constructor(video, elements, state) {
		this.video = video;
		this.elements = elements;
		this.state = state;
	}

	/**
	 * @description Toggles semantic playback and translates browser rejection into a visible bounded status.
	 * @returns {Promise<boolean>} True when a playback state transition succeeds, otherwise false.
	 * @throws {never} Browser `play()` rejection is contained and communicated through player state.
	 */
	async toggle() {
		if (!this.video.src) {
			return false;
		}
		if (!this.video.paused) {
			this.video.pause();
			return true;
		}
		try {
			await this.video.play();
			return true;
		} catch {
			this.state.status('error', 'Playback was blocked. Press play to try again.');
			return false;
		}
	}

	/**
	 * @description Maps the normalized timeline range into authoritative current media time.
	 * @returns {void} Updates `video.currentTime` only when finite duration exists, then synchronizes controls.
	 * @throws {never} Missing or invalid duration is safely ignored.
	 */
	seekNormalized() {
		const duration = finiteMediaTime(this.video.duration);
		if (duration <= 0) {
			return;
		}
		const progress = Number(this.elements.seek.value) / 1000;
		this.video.currentTime = duration * progress;
		this.state.sync();
	}

	/**
	 * @description Moves playback by a signed number of seconds while clamping to known media bounds.
	 * @param {number} seconds Signed seek delta, positive forward and negative backward.
	 * @returns {void} Updates semantic current time and visible controls.
	 * @throws {never} Invalid values normalize to zero and cannot create negative media time.
	 */
	seekBy(seconds) {
		const current = finiteMediaTime(this.video.currentTime);
		const duration = finiteMediaTime(this.video.duration);
		const requested = Math.max(0, current + Number(seconds || 0));
		this.video.currentTime = duration > 0 ? Math.min(duration, requested) : requested;
		this.state.sync();
	}
}
