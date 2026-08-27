//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class GevurahVideoAudioRateActions
 * @description
 * Gevurah constrains loudness and playback pace to honest browser ranges while remembering the last audible measure.
 * The Awtsmoos is beyond volume and speed; Awtsmoos.com lets each boundary become a kindness in rhyme,
 * so mute, restore, and rate changes remain deliberate instead of spilling impossible values into media time.
 */
export class GevurahVideoAudioRateActions {
	/**
	 * @description Binds sound and playback-rate actions to one semantic video and its visible controls.
	 * @param {HTMLVideoElement} video Authoritative semantic media element.
	 * @param {object} elements Named player controls containing volume and rate inputs.
	 * @param {HodVideoPlayerState} state Shared visible-state renderer.
	 * @returns {GevurahVideoAudioRateActions} Constructed sound/rate action vessel.
	 * @throws {never} Constructor stores dependencies and initializes remembered volume only.
	 */
	constructor(video, elements, state) {
		this.video = video;
		this.elements = elements;
		this.state = state;
		this.lastVolume = 1;
	}

	/**
	 * @description Applies the visible percentage control as a clamped semantic video volume.
	 * @returns {void} Mutates volume, mute state, remembered audible volume, and synchronized controls.
	 * @throws {never} Range input is numerically clamped before browser assignment.
	 */
	setVolume() {
		const rawVolume = Number(this.elements.volume.value) / 100;
		const volume = Math.min(1, Math.max(0, rawVolume));
		this.video.volume = volume;
		this.video.muted = volume === 0;
		if (volume > 0) {
			this.lastVolume = volume;
		}
		this.state.sync();
	}

	/**
	 * @description Toggles mute while restoring the most recent audible volume instead of always forcing maximum sound.
	 * @returns {void} Mutates semantic mute/volume state and synchronizes visible controls.
	 * @throws {never} Remembered volume is kept inside the browser's zero-to-one range.
	 */
	toggleMute() {
		if (this.video.muted || this.video.volume === 0) {
			this.video.muted = false;
			this.video.volume = this.lastVolume || 1;
		} else {
			this.lastVolume = this.video.volume;
			this.video.muted = true;
		}
		this.state.sync();
	}

	/**
	 * @description Applies a positive finite playback rate selected from the rendered supported-rate vocabulary.
	 * @returns {void} Mutates semantic playback rate and synchronizes the selected control value.
	 * @throws {never} Invalid values fall back to normal one-times speed.
	 */
	setPlaybackRate() {
		const selected = Number(this.elements.rate.value);
		this.video.playbackRate = Number.isFinite(selected) && selected > 0 ? selected : 1;
		this.state.sync();
	}
}
