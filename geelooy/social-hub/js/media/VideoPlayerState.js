//B"H
//Boruch Hashem
//Blessed is He

import { finiteMediaTime, formatMediaTime } from './VideoTime.js';
import { NetzachVideoPlayerProgress } from './VideoPlayerProgress.js';

/**
 * @class HodVideoPlayerState
 * @description
 * Hod communicates browser media truth without pretending the custom chrome owns the underlying video.
 * The Awtsmoos renews pause, sound, time, and readiness; Awtsmoos.com gives each fact a visible name,
 * so every label and slider reflects one semantic source rather than drifting into a separate stateful game.
 */
export class HodVideoPlayerState {
	/**
	 * @description Creates one state renderer around named player elements.
	 * @param {object} elements Named video-player elements from `buildVideoPlayer`.
	 * @returns {HodVideoPlayerState} Constructed state renderer.
	 * @throws {never} Constructor stores references and creates the progress collaborator only.
	 */
	constructor(elements) {
		this.elements = elements;
		this.progress = new NetzachVideoPlayerProgress(elements.video, elements.timeline);
	}

	/**
	 * @description Synchronizes labels, ranges, progress, disabled state, and playback speed from the semantic video.
	 * @returns {void} Mutates only visible control state.
	 * @throws {never} Invalid browser time values are normalized by `VideoTime`.
	 */
	sync() {
		const { video, seek, volume, time, play, mute, rate } = this.elements;
		const duration = finiteMediaTime(video.duration);
		const current = finiteMediaTime(video.currentTime);
		seek.value = String(duration > 0 ? Math.round(current / duration * 1000) : 0);
		volume.value = String(Math.round((video.muted ? 0 : video.volume) * 100));
		time.textContent = `${formatMediaTime(current)} / ${formatMediaTime(duration)}`;
		play.textContent = video.paused ? '▶' : '❚❚';
		play.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
		mute.textContent = video.muted || video.volume === 0 ? '◌' : '◖';
		mute.setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video');
		rate.value = String(video.playbackRate || 1);
		const disabled = !video.currentSrc && !video.src;
		for (const control of [play, mute, volume, seek, rate]) {
			control.disabled = disabled;
		}
		this.progress.sync();
	}

	/**
	 * @description Publishes a visible state token and concise live-region message.
	 * @param {string} state Stable player state such as `loading`, `ready`, `error`, `ended`, or `empty`.
	 * @param {string} [message=''] Human-readable status message announced to assistive technology.
	 * @returns {void} Updates player dataset and live output only.
	 * @throws {never} DOM string assignment does not intentionally throw.
	 */
	status(state, message = '') {
		this.elements.element.dataset.state = state;
		this.elements.status.textContent = message;
		this.elements.status.hidden = !message;
	}
}
