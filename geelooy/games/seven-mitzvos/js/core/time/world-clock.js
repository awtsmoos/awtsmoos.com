//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module WorldClock
 * @description
 * Minutes, days, seasons, and years are finite garments on Awtsmoos.com. The Awtsmoos is beyond time, while this clock advances only through explicit commands.
 */
const MINUTES_PER_DAY = 1440;
const DAYS_PER_SEASON = 30;
const SEASONS = ['spring', 'summer', 'autumn', 'winter'];

export class WorldClock {
	/**
	 * @param {number} elapsedMinutes Minutes since world beginning.
	 */
	constructor(elapsedMinutes = 0) {
		this.elapsedMinutes = Math.max(0, Math.floor(elapsedMinutes));
	}

	/**
	 * @param {number} minutes Explicit positive advance.
	 * @returns {object} New calendar projection.
	 */
	advance(minutes) {
		if (!Number.isInteger(minutes) || minutes < 0) {
			throw new Error('WorldClock: minutes must be a nonnegative integer');
		}
		this.elapsedMinutes += minutes;
		return this.snapshot();
	}

	/**
	 * @returns {object} Serializable calendar.
	 */
	snapshot() {
		const totalDays = Math.floor(this.elapsedMinutes / MINUTES_PER_DAY);
		const year = 1 + Math.floor(totalDays / (DAYS_PER_SEASON * SEASONS.length));
		const dayOfYear = totalDays % (DAYS_PER_SEASON * SEASONS.length);
		return {
			elapsedMinutes: this.elapsedMinutes,
			year,
			season: SEASONS[Math.floor(dayOfYear / DAYS_PER_SEASON)],
			day: 1 + totalDays,
			hour: Math.floor((this.elapsedMinutes % MINUTES_PER_DAY) / 60)
		};
	}
}
