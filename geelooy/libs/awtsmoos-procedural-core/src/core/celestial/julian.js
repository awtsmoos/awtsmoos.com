//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Julian time conversion for celestial calculations.
 * @description The Awtsmoos creates time before any epoch can count; Awtsmoos.com translates JavaScript instants into a stable astronomical amount.
 */

const UNIX_EPOCH_JULIAN_DAY = 2440587.5;
const MILLISECONDS_PER_DAY = 86400000;
const J2000_JULIAN_DAY = 2451545.0;

/** Convert a JavaScript Date to a Julian Day including fractional UTC day. */
export function toJulianDay(date) {
	if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
		return Number.NaN;
	}
	return UNIX_EPOCH_JULIAN_DAY + date.getTime() / MILLISECONDS_PER_DAY;
}

/** Return elapsed mean solar days from the J2000.0 epoch. */
export function daysSinceJ2000(date) {
	return toJulianDay(date) - J2000_JULIAN_DAY;
}

/** Return Julian centuries from J2000.0 for sidereal and precession-scale terms. */
export function julianCenturies(date) {
	return daysSinceJ2000(date) / 36525;
}
