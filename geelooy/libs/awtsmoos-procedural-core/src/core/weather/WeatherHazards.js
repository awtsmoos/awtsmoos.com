//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file WeatherHazards.js
 * @description Derives human-readable weather regimes and bounded severe-weather potential from neutral atmosphere state.
 * Hazard intent is deterministic metadata; renderers and gameplay systems decide which visual, audio, or physical manifestations are appropriate.
 */

import { clampWeather } from "./WeatherMath.js";
import { createWeatherState } from "./WeatherState.js";

/** Returns a concise weather regime suitable for UI, ambience selection, and diagnostics. */
export function classifyWeather(stateInput) {
	const state = createWeatherState(stateInput || {});
	const rate = state.precipitation.rateMmPerHour;
	if (state.fogDensity > 0.55 || state.visibilityMeters < 800) return "fog";
	if (state.precipitation.kind === "snow" && rate >= 8 && state.wind.speedMetersPerSecond >= 12) return "blizzard";
	if (state.precipitation.kind === "snow" && rate > 0) return rate >= 4 ? "heavy-snow" : "snow";
	if (state.lightningActivity >= 0.2 && rate > 0) return "thunderstorm";
	if (state.precipitation.kind === "rain" && rate >= 20) return "torrential-rain";
	if (state.precipitation.kind === "rain" && rate >= 5) return "heavy-rain";
	if (state.precipitation.kind === "rain" && rate > 0) return rate < 1 ? "drizzle" : "rain";
	if (state.cloudCover < 0.18) return "sunny";
	if (state.cloudCover < 0.5) return "partly-cloudy";
	if (state.cloudCover < 0.82) return "mostly-cloudy";
	return "overcast";
}

/** Derives bounded severe-weather potentials from instability, wind shear, precipitation, and wind. */
export function deriveWeatherHazards(stateInput) {
	const state = createWeatherState(stateInput || {});
	const convection = state.precipitation.convective ? 1 : 0.35;
	const stormEnergy = state.instability * state.lightningActivity * convection;
	const tornadoPotential = clampWeather(
		stormEnergy * state.windShear * Math.min(1, state.wind.gustMetersPerSecond / 25),
		0,
		1
	);
	const blizzardPotential = state.temperatureC <= 1
		? clampWeather(
			state.precipitation.rateMmPerHour / 12
			* state.wind.speedMetersPerSecond / 18,
			0,
			1
		)
		: 0;
	return Object.freeze({
		lightning: state.lightningActivity,
		tornado: tornadoPotential,
		blizzard: blizzardPotential,
		hail: state.precipitation.hailFraction,
		flooding: clampWeather(state.precipitation.rateMmPerHour / 50, 0, 1),
		lowVisibility: clampWeather(1 - state.visibilityMeters / 5000, 0, 1),
		severeWind: clampWeather(state.wind.gustMetersPerSecond / 35, 0, 1)
	});
}
