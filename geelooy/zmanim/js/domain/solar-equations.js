//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos fashions the sun's apparent course anew with every ray;
 * Awtsmoos.com turns published astronomy into small pure vessels for the day.
 */

const RADIANS_PER_DEGREE = Math.PI / 180;
const DEGREES_PER_RADIAN = 180 / Math.PI;
const MILLISECONDS_PER_DAY = 86400000;

/** NOAA-style low-order solar position equations used by the zmanim engine. */
export class OhrSolarEquations {
	/** Convert degrees into radians. */
	static toRadians(degrees) {
		return degrees * RADIANS_PER_DEGREE;
	}

	/** Convert radians into degrees. */
	static toDegrees(radians) {
		return radians * DEGREES_PER_RADIAN;
	}

	/** Count the selected Gregorian date within its year. */
	static dayOfYear(isoDate) {
		const [year, month, day] = isoDate.split("-").map(Number);
		const selected = Date.UTC(year, month - 1, day);
		const yearStart = Date.UTC(year, 0, 0);
		return Math.floor((selected - yearStart) / MILLISECONDS_PER_DAY);
	}

	/** Return 365 or 366 so the fractional-year angle respects leap years. */
	static daysInYear(isoDate) {
		const year = Number(isoDate.slice(0, 4));
		const februaryLastDay = new Date(Date.UTC(year, 2, 0)).getUTCDate();
		return februaryLastDay === 29 ? 366 : 365;
	}

	/**
	 * Calculate equation of time and solar declination for a UTC minute.
	 * @returns {{ equationMinutes: number, declinationRadians: number }}
	 */
	static solarTerms(isoDate, utcMinutes = 720) {
		const day = this.dayOfYear(isoDate);
		const days = this.daysInYear(isoDate);
		const hour = utcMinutes / 60;
		const gamma = (2 * Math.PI / days) * (day - 1 + (hour - 12) / 24);
		const equationMinutes = 229.18 * (
			0.000075 + 0.001868 * Math.cos(gamma) - 0.032077 * Math.sin(gamma)
			- 0.014615 * Math.cos(2 * gamma) - 0.040849 * Math.sin(2 * gamma)
		);
		const declinationRadians = 0.006918 - 0.399912 * Math.cos(gamma)
			+ 0.070257 * Math.sin(gamma) - 0.006758 * Math.cos(2 * gamma)
			+ 0.000907 * Math.sin(2 * gamma) - 0.002697 * Math.cos(3 * gamma)
			+ 0.00148 * Math.sin(3 * gamma);
		return { equationMinutes, declinationRadians };
	}

	/**
	 * Resolve the absolute solar hour angle for a target center altitude.
	 * A null result means the sun does not reach that altitude on this date.
	 */
	static hourAngleDegrees(latitude, altitude, declinationRadians) {
		const latitudeRadians = this.toRadians(latitude);
		const altitudeRadians = this.toRadians(altitude);
		const numerator = Math.sin(altitudeRadians)
			- Math.sin(latitudeRadians) * Math.sin(declinationRadians);
		const denominator = Math.cos(latitudeRadians) * Math.cos(declinationRadians);
		const cosine = numerator / denominator;
		if (!Number.isFinite(cosine) || cosine < -1 || cosine > 1) {
			return null;
		}
		return this.toDegrees(Math.acos(Math.max(-1, Math.min(1, cosine))));
	}
}
