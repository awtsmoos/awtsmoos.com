// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file gameTimeOfDay.js
 * @description Zmanim-driven time of day for MitzvahWorld games.
 * Uses the user's geolocation + Awtsmoos zmanim solar calculations to set
 * the game's sky, sun position, and lighting to match the REAL time of day
 * where the user actually is. Morning looks like morning, sunset like sunset.
 *
 * Yaakov 2026-10-13: "Use the zmanim API to define the exact time of day
 * based on the location of the user at that time."
 */

// B"H — fixed 2026-10-13: path was ../../zmanim (resolved to geelooy/games/zmanim,
// missing). From geelooy/games/mitzvahWorld/shared/ the zmanim domain is ../../../zmanim.
import { ChochmahSolarEvents } from "../../../zmanim/js/domain/solar-events.js";

/** Default location (Yerushalayim) when geolocation is unavailable. */
const FALLBACK_LOCATION = { latitude: 31.7683, longitude: 35.2137, label: "Yerushalayim" };

/** Sky palettes keyed by phase. [topColor, horizonColor, sunColor, ambient] */
const SKY_PHASES = {
	night:     { top: "#060a18", horizon: "#101a30", sun: "#223",     ambient: 0.25, stars: true  },
	dawn:      { top: "#2a3a5e", horizon: "#e8905a", sun: "#ffb36b",  ambient: 0.55, stars: false },
	morning:   { top: "#3a7bd5", horizon: "#aed6f1", sun: "#fff3b0",  ambient: 0.85, stars: false },
	midday:    { top: "#2b6fd4", horizon: "#bfe3f0", sun: "#ffffff",  ambient: 1.0,  stars: false },
	afternoon: { top: "#3a7bd5", horizon: "#c8dba8", sun: "#ffedb0",  ambient: 0.9,  stars: false },
	sunset:    { top: "#3a2a5e", horizon: "#ff7a4a", sun: "#ff9a5a",  ambient: 0.5,  stars: false },
	dusk:      { top: "#1a2340", horizon: "#5a4a7a", sun: "#7a5a8a",  ambient: 0.35, stars: true  },
};

/**
 * Get the user's location via geolocation API, with fallback.
 * @returns {Promise<{latitude:number, longitude:number, label:string}>}
 */
export function getUserLocation() {
	return new Promise((resolve) => {
		if (!("geolocation" in navigator)) {
			resolve(FALLBACK_LOCATION);
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(pos) => resolve({
				latitude: pos.coords.latitude,
				longitude: pos.coords.longitude,
				label: "user",
			}),
			() => resolve(FALLBACK_LOCATION),
			{ timeout: 8000, maximumAge: 600000 }
		);
		// Safety: never hang longer than 9s
		setTimeout(() => resolve(FALLBACK_LOCATION), 9000);
	});
}

/**
 * Compute today's solar anchors for a location.
 * @returns {{sunrise:Date, sunset:Date, solarNoon:Date, now:Date}}
 */
export function getSolarAnchors(latitude, longitude, now = new Date()) {
	const isoDate = now.toISOString().slice(0, 10);
	// B"H — fixed 2026-10-13: the API takes "morning"/"evening", not
	// "rising"/"setting" (anything else silently meant evening).
	const sunrise = ChochmahSolarEvents.eventAt(isoDate, latitude, longitude, -0.833, "morning");
	const sunset = ChochmahSolarEvents.eventAt(isoDate, latitude, longitude, -0.833, "evening");
	const solarNoon = ChochmahSolarEvents.solarNoon(isoDate, longitude);
	return { sunrise, sunset, solarNoon, now };
}

/**
 * Determine the time-of-day phase from solar anchors.
 * @returns {"night"|"dawn"|"morning"|"midday"|"afternoon"|"sunset"|"dusk"}
 */
export function getTimePhase(anchors) {
	const { sunrise, sunset, solarNoon, now } = anchors;
	const t = now.getTime();
	if (!sunrise || !sunset) return "midday"; // polar edge: default to day

	const sr = sunrise.getTime();
	const ss = sunset.getTime();
	const noon = solarNoon ? solarNoon.getTime() : (sr + ss) / 2;

	const HOUR = 3600000;
	if (t < sr - HOUR) return "night";
	if (t < sr) return "dawn";
	if (t < sr + HOUR * 1.5) return "morning";
	if (t < noon - HOUR) return "morning";
	if (t < noon + HOUR) return "midday";
	if (t < ss - HOUR * 1.5) return "afternoon";
	if (t < ss) return "sunset";
	if (t < ss + HOUR) return "dusk";
	return "night";
}

/**
 * Approximate sun position as altitude/azimuth degrees.
 * Simple model: sun rises east, peaks at solar noon, sets west.
 */
export function getSunPosition(anchors) {
	const { sunrise, sunset, solarNoon, now } = anchors;
	const t = now.getTime();
	const sr = sunrise ? sunrise.getTime() : t - 6 * 3600000;
	const ss = sunset ? sunset.getTime() : t + 6 * 3600000;
	const noon = solarNoon ? solarNoon.getTime() : (sr + ss) / 2;

	if (t <= sr || t >= ss) {
		// Night: sun below horizon; return moon-ish position instead
		const nightProgress = t < sr
			? (t - (ss - 24 * 3600000)) / (24 * 3600000 - (ss - sr))
			: (t - ss) / (24 * 3600000 - (ss - sr));
		return { altitude: -20, azimuth: 180 + nightProgress * 180, isDay: false };
	}
	// Day: altitude peaks at solar noon
	const dayProgress = (t - sr) / (ss - sr); // 0..1
	const altitude = Math.sin(dayProgress * Math.PI) * 65; // max ~65 deg
	const azimuth = 90 + dayProgress * 180; // east(90) -> south(180) -> west(270)
	return { altitude, azimuth, isDay: true };
}

/**
 * Full time-of-day state for the game renderer.
 * @returns {Promise<{phase:string, sky:Object, sun:{altitude,azimuth,isDay}, location:Object}>}
 */
export async function getGameTimeOfDay() {
	const location = await getUserLocation();
	const anchors = getSolarAnchors(location.latitude, location.longitude);
	const phase = getTimePhase(anchors);
	const sky = SKY_PHASES[phase];
	const sun = getSunPosition(anchors);
	return { phase, sky, sun, location, anchors };
}

/**
 * Convert sun altitude/azimuth to a WebGL-friendly direction vector.
 * @returns {[x,y,z]} normalized
 */
export function sunDirectionVector(altitudeDeg, azimuthDeg) {
	const alt = altitudeDeg * Math.PI / 180;
	const az = azimuthDeg * Math.PI / 180;
	return [
		Math.cos(alt) * Math.sin(az),
		Math.sin(alt),
		Math.cos(alt) * Math.cos(az),
	];
}
