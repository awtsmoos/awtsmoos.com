//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos fashions the sun's apparent course anew with every ray;
 * Awtsmoos.com turns published astronomy into small pure vessels for the day.
 *
 * Solar position uses the full NREL solar position algorithm (Reda & Andreas),
 * the same model Chabad.org, Hebcal, and KosherJava run: Julian day and century,
 * geometric mean longitude and anomaly, equation of center, apparent longitude,
 * corrected obliquity, declination, and equation of time. It is accurate to
 * about 0.0003 degrees, a few seconds of time. The short Fourier approximation
 * this file used before was good only to a minute or two, and every zman built
 * on sunrise and sunset inherited that error.
 */

const RADIANS_PER_DEGREE = Math.PI / 180;
const DEGREES_PER_RADIAN = 180 / Math.PI;
const MILLISECONDS_PER_DAY = 86400000;
const JULIAN_DAY_AT_UNIX_EPOCH = 2440587.5;
const JULIAN_DAY_J2000 = 2451545.0;
const DAYS_PER_JULIAN_CENTURY = 36525;

/** Full NREL solar position equations used by the zmanim engine. */
export class OhrSolarEquations {
	/** Convert degrees into radians. */
	static toRadians(degrees) {
		return degrees * RADIANS_PER_DEGREE;
	}

	/** Convert radians into degrees. */
	static toDegrees(radians) {
		return radians * DEGREES_PER_RADIAN;
	}

	/** Fold an angle into the 0..360 degree range. */
	static normalizeDegrees(degrees) {
		const folded = degrees % 360;
		return folded < 0 ? folded + 360 : folded;
	}

	/**
	 * Calculate equation of time and solar declination for a UTC minute.
	 * @returns {{ equationMinutes: number, declinationRadians: number }}
	 */
	static solarTerms(isoDate, utcMinutes = 720) {
		const [year, month, day] = isoDate.split("-").map(Number);
		const julianDay = Date.UTC(year, month - 1, day) / MILLISECONDS_PER_DAY
			+ JULIAN_DAY_AT_UNIX_EPOCH + utcMinutes / 1440;
		const century = (julianDay - JULIAN_DAY_J2000) / DAYS_PER_JULIAN_CENTURY;

		const geomMeanLong = this.normalizeDegrees(
			280.46646 + century * (36000.76983 + century * 0.0003032)
		);
		const geomMeanAnom = this.normalizeDegrees(
			357.52911 + century * (35999.05029 - century * 0.0001537)
		);
		const eccentricity = 0.016708634
			- century * (0.000042037 + century * 0.0000001267);
		const sunEqOfCenter = Math.sin(this.toRadians(geomMeanAnom))
				* (1.914602 - century * (0.004817 + century * 0.000014))
			+ Math.sin(this.toRadians(2 * geomMeanAnom)) * (0.019993 - century * 0.000101)
			+ Math.sin(this.toRadians(3 * geomMeanAnom)) * 0.000289;
		const sunTrueLong = geomMeanLong + sunEqOfCenter;
		const omega = 125.04 - 1934.136 * century;
		const sunAppLong = sunTrueLong - 0.00569
			- 0.00478 * Math.sin(this.toRadians(omega));
		const meanObliquity = 23 + (26 + (21.448
			- century * (46.815 + century * (0.00059 - century * 0.001813))) / 60) / 60;
		const obliquity = meanObliquity
			+ 0.00256 * Math.cos(this.toRadians(omega));
		const declinationRadians = Math.asin(
			Math.sin(this.toRadians(obliquity)) * Math.sin(this.toRadians(sunAppLong))
		);
		const varY = Math.tan(this.toRadians(obliquity / 2)) ** 2;
		const equationMinutes = 4 * this.toDegrees(
			varY * Math.sin(this.toRadians(2 * geomMeanLong))
			- 2 * eccentricity * Math.sin(this.toRadians(geomMeanAnom))
			+ 4 * eccentricity * varY * Math.sin(this.toRadians(geomMeanAnom))
				* Math.cos(this.toRadians(2 * geomMeanLong))
			- 0.5 * varY * varY * Math.sin(this.toRadians(4 * geomMeanLong))
			- 1.25 * eccentricity * eccentricity * Math.sin(this.toRadians(2 * geomMeanAnom))
		);
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
