//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file WeatherPresets.js
 * @description Named atmospheric baselines for tests, authored worlds, debugging, and graceful fallbacks.
 * Presets are neutral physical descriptors; spatial fronts and climate systems may continuously vary them afterward.
 */

import { createWeatherState } from "./WeatherState.js";

const PRESET_INPUTS = Object.freeze({
	sunny: { cloudCover: 0.08, humidity: 0.42, windSpeed: 2, visibilityMeters: 60000 },
	"partly-cloudy": { cloudCover: 0.4, humidity: 0.55, windSpeed: 3, visibilityMeters: 45000 },
	overcast: { cloudCover: 0.95, humidity: 0.72, windSpeed: 4, visibilityMeters: 25000 },
	drizzle: { cloudCover: 0.95, humidity: 0.9, precipitationRate: 0.5, precipitationKind: "rain", visibilityMeters: 10000 },
	rain: { cloudCover: 1, humidity: 0.95, precipitationRate: 4, precipitationKind: "rain", windSpeed: 5, visibilityMeters: 8000 },
	"heavy-rain": { cloudCover: 1, humidity: 1, precipitationRate: 18, precipitationKind: "rain", windSpeed: 9, windGust: 15, visibilityMeters: 3500 },
	thunderstorm: { cloudCover: 1, humidity: 0.94, precipitationRate: 25, precipitationKind: "rain", windSpeed: 12, windGust: 24, lightningActivity: 0.65, instability: 0.8, windShear: 0.55, convective: true },
	snow: { temperatureC: -4, cloudCover: 0.9, humidity: 0.82, precipitationRate: 3, precipitationKind: "snow", windSpeed: 4, visibilityMeters: 9000 },
	blizzard: { temperatureC: -10, cloudCover: 1, humidity: 0.9, precipitationRate: 12, precipitationKind: "snow", windSpeed: 18, windGust: 28, visibilityMeters: 500, turbulence: 0.8 }
});

/** Returns all stable preset names without exposing mutable internal records. */
export function listWeatherPresets() {
	return Object.freeze(Object.keys(PRESET_INPUTS));
}

/** Resolves one named preset with optional bounded caller overrides. */
export function createWeatherPreset(name, overrides = {}) {
	const key = String(name || "sunny").toLowerCase();
	const source = PRESET_INPUTS[key] || PRESET_INPUTS.sunny;
	return createWeatherState({ ...source, ...overrides, source: `preset:${key}` });
}
