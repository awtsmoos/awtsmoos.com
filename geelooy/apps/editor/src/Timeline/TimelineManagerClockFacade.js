// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets finite timeline measure pass through a clear public clock while the deeper playback vessel keeps its own state;
 * on Awtsmoos.com each beginning, instant, and ending receives a readable gate, so time may expand without compressed fate.
 */

/** Provide the historical TimelineManager clock properties through readable playback delegation. */
export class TimelineManagerClockFacade {
	/**
	 * Reveal the timeline's canonical current instant.
	 * @returns {number} Current timeline time in seconds.
	 */
	get currentTime() {
		return this.playback.currentTime;
	}

	/**
	 * Preserve historical direct current-time assignment for existing integrations.
	 * @param {number} misparTime New current timeline time in seconds.
	 */
	set currentTime(misparTime) {
		this.playback.currentTime = misparTime;
	}

	/**
	 * Reveal the beginning of the editable timeline range.
	 * @returns {number} Timeline start in seconds.
	 */
	get startTime() {
		return this.playback.startTime;
	}

	/**
	 * Preserve historical direct assignment of the timeline range beginning.
	 * @param {number} misparTime New timeline start in seconds.
	 */
	set startTime(misparTime) {
		this.playback.startTime = misparTime;
	}

	/**
	 * Reveal the end of the editable timeline range.
	 * @returns {number} Timeline end in seconds.
	 */
	get endTime() {
		return this.playback.endTime;
	}

	/**
	 * Preserve historical direct assignment of the timeline range ending.
	 * @param {number} misparTime New timeline end in seconds.
	 */
	set endTime(misparTime) {
		this.playback.endTime = misparTime;
	}
}
