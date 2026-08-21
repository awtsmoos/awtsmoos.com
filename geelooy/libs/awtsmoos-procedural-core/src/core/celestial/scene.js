//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file One renderer-neutral celestial scene snapshot.
 * @description The Awtsmoos contains no parts while the sky presents sun, moon, and stars as many vessels; Awtsmoos.com gathers them into one immutable moment for every renderer that serves.
 */

import { visibleBrightStars } from "./brightStars.js";
import { projectHorizon } from "./horizon.js";
import { buildLensFlarePlan } from "./lensFlare.js";
import { moonPhase } from "./moonPhase.js";
import { lunarPosition } from "./moonPosition.js";
import { solarPosition } from "./sunPosition.js";

/** Build a complete celestial snapshot for one UTC instant and Earth observer. */
export function buildCelestialScene(date, observer, options = {}) {
	const sun = solarPosition(date, observer);
	const moon = lunarPosition(date, observer);
	const sunPoint = projectHorizon(sun);
	const moonPoint = projectHorizon(moon);
	const stars = visibleBrightStars(date, observer, options.minimumStarAltitude ?? -4);
	const phase = moonPhase(date);
	return {
		date,
		observer: { ...observer },
		sun: { ...sun, ...sunPoint },
		moon: { ...moon, ...moonPoint, phase },
		stars,
		lensFlare: buildLensFlarePlan(sunPoint, {
			altitudeDegrees: sun.altitudeDegrees,
			ghostCount: options.ghostCount ?? 4,
			intensity: options.flareIntensity ?? 1
		})
	};
}
