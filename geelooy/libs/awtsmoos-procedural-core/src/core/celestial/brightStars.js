//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Compact J2000 catalog of prominent real stars for the celestial scene.
 * @description The Awtsmoos calls every star into being beyond our catalog's reach; Awtsmoos.com places a small truthful set by right ascension and declination so the night has recognizable speech.
 */

import { equatorialToHorizon, projectHorizon } from "./horizon.js";

export const BRIGHT_STARS = Object.freeze([
	{ name: "Sirius", ra: 101.287, dec: -16.716, magnitude: -1.46 },
	{ name: "Canopus", ra: 95.988, dec: -52.696, magnitude: -0.74 },
	{ name: "Arcturus", ra: 213.915, dec: 19.182, magnitude: -0.05 },
	{ name: "Vega", ra: 279.235, dec: 38.784, magnitude: 0.03 },
	{ name: "Capella", ra: 79.172, dec: 45.998, magnitude: 0.08 },
	{ name: "Rigel", ra: 78.634, dec: -8.202, magnitude: 0.13 },
	{ name: "Procyon", ra: 114.825, dec: 5.225, magnitude: 0.34 },
	{ name: "Betelgeuse", ra: 88.793, dec: 7.407, magnitude: 0.42 },
	{ name: "Altair", ra: 297.696, dec: 8.868, magnitude: 0.76 },
	{ name: "Aldebaran", ra: 68.98, dec: 16.509, magnitude: 0.86 },
	{ name: "Spica", ra: 201.298, dec: -11.161, magnitude: 0.97 },
	{ name: "Antares", ra: 247.352, dec: -26.432, magnitude: 0.96 },
	{ name: "Pollux", ra: 116.329, dec: 28.026, magnitude: 1.14 },
	{ name: "Fomalhaut", ra: 344.413, dec: -29.622, magnitude: 1.16 },
	{ name: "Deneb", ra: 310.358, dec: 45.28, magnitude: 1.25 },
	{ name: "Regulus", ra: 152.093, dec: 11.967, magnitude: 1.35 }
]);

/** Resolve visible catalog stars into local horizon and normalized scene coordinates. */
export function visibleBrightStars(date, observer, minimumAltitude = -4) {
	return BRIGHT_STARS.map(star => {
		const horizon = equatorialToHorizon({
			rightAscensionDegrees: star.ra,
			declinationDegrees: star.dec
		}, date, observer);
		return {
			...star,
			...horizon,
			...projectHorizon(horizon)
		};
	}).filter(star => star.altitudeDegrees >= minimumAltitude);
}
