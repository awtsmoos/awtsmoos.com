//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Lunar phase and elongation descriptors.
 * @description The Awtsmoos is unchanged as the moon waxes and wanes; Awtsmoos.com names the created phase without confusing reflected light for a source of its own.
 */

import { clamp, cosDegrees, normalizeDegrees } from "./angles.js";
import { lunarEquatorialPosition } from "./moonPosition.js";
import { solarEquatorialPosition } from "./sunPosition.js";

const PHASE_NAMES = Object.freeze([
	"New moon",
	"Waxing crescent",
	"First quarter",
	"Waxing gibbous",
	"Full moon",
	"Waning gibbous",
	"Last quarter",
	"Waning crescent"
]);

/** Return lunar elongation, illuminated fraction, age fraction, and a human phase name. */
export function moonPhase(date) {
	const sun = solarEquatorialPosition(date);
	const moon = lunarEquatorialPosition(date);
	const elongationDegrees = normalizeDegrees(
		moon.eclipticLongitudeDegrees - sun.eclipticLongitudeDegrees
	);
	const illuminatedFraction = clamp(
		(1 - cosDegrees(elongationDegrees)) / 2,
		0,
		1
	);
	const cycleFraction = elongationDegrees / 360;
	const phaseIndex = Math.round(cycleFraction * 8) % 8;
	return {
		elongationDegrees,
		illuminatedFraction,
		cycleFraction,
		waxing: elongationDegrees < 180,
		name: PHASE_NAMES[phaseIndex]
	};
}
