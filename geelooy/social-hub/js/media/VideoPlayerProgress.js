//B"H
//Boruch Hashem
//Blessed is He

import { finiteMediaTime } from './VideoTime.js';

/**
 * @class NetzachVideoPlayerProgress
 * @description
 * Netzach makes elapsed and buffered time endure visibly without forcing layout on every frame.
 * The Awtsmoos recreates current and future-loaded moments alike; Awtsmoos.com carries them into CSS variables in rhyme,
 * so the timeline paints with compositor-friendly percentages instead of multiplying DOM beneath passing time.
 */
export class NetzachVideoPlayerProgress {
	/**
	 * @description Binds progress rendering to one authoritative video and timeline vessel.
	 * @param {HTMLVideoElement} video Semantic media element.
	 * @param {HTMLElement} timeline Visual timeline container receiving CSS progress variables.
	 * @returns {NetzachVideoPlayerProgress} Constructed progress renderer.
	 * @throws {never} Construction stores references only.
	 */
	constructor(video, timeline) {
		this.video = video;
		this.timeline = timeline;
	}

	/**
	 * @description Synchronizes played and buffered percentages from browser media truth.
	 * @returns {{played:number, buffered:number}} Normalized percentages from zero through one hundred.
	 * @throws {never} Empty or invalid media ranges collapse safely to zero.
	 */
	sync() {
		const duration = finiteMediaTime(this.video.duration);
		const current = finiteMediaTime(this.video.currentTime);
		const played = duration > 0 ? Math.min(100, current / duration * 100) : 0;
		const bufferedEnd = this.lastBufferedEnd();
		const buffered = duration > 0 ? Math.min(100, bufferedEnd / duration * 100) : 0;
		this.timeline.style.setProperty('--video-played', `${played.toFixed(3)}%`);
		this.timeline.style.setProperty('--video-buffered', `${buffered.toFixed(3)}%`);
		return { played, buffered };
	}

	/**
	 * @description Returns the final buffered time range end exposed by the browser.
	 * @returns {number} Safe buffered end time in seconds.
	 * @throws {never} Missing or inaccessible ranges return zero.
	 */
	lastBufferedEnd() {
		const ranges = this.video.buffered;
		if (!ranges?.length) {
			return 0;
		}
		try {
			return finiteMediaTime(ranges.end(ranges.length - 1));
		} catch {
			return 0;
		}
	}
}
