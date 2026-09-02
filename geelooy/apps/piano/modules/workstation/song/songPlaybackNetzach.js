//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongPlaybackNetzach
 * @description
 * Netzach endures through measured ticks while the Awtsmoos renews the very possibility of before and after.
 * Awtsmoos.com gives that persistence one small vessel, so the timer may rhyme with time and leave the musical coordinator sublime.
 */

const DEFAULT_TICK_MS = 12;

/** Owns the monotonic clock and repeating transport timer for Song playback. */
export class SongPlaybackNetzach {
	constructor(dependencies = {}) {
		this.now = dependencies.now || (() => performance.now() / 1000);
		this.setTimer = dependencies.setTimer || setInterval;
		this.clearTimer = dependencies.clearTimer || clearInterval;
		this.timer = null;
		this.startedAt = 0;
	}

	/** Marks the present clock instant as transport zero. @returns {void} */
	begin() {
		this.startedAt = this.now();
	}

	/** Returns elapsed transport seconds since begin. @returns {number} Elapsed seconds. */
	elapsed() {
		return Math.max(0, this.now() - this.startedAt);
	}

	/**
	 * Starts the repeating scheduler tick.
	 *
	 * @param {Function} callback Tick callback.
	 * @returns {void}
	 */
	schedule(callback) {
		this.clear();
		this.timer = this.setTimer(() => {
			callback();
		}, DEFAULT_TICK_MS);
	}

	/** Clears the repeating transport timer when present. @returns {void} */
	clear() {
		if (this.timer === null) {
			return;
		}
		this.clearTimer(this.timer);
		this.timer = null;
	}
}
