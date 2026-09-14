//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file WeatherState.js
 * @description Defines one bounded renderer-neutral atmospheric state shared by every world subsystem.
 * Raw provider-like input and already-normalized Core state both resolve idempotently without renderer, DOM, or network assumptions.
 */

import { clampWeather, weatherDirection } from "./WeatherMath.js";

/** Returns a top-level value before a compatible nested canonical value and finally a fallback. */
function nested(input, directKey, groupKey, nestedKey, fallback) {
	return input?.[directKey] ?? input?.[groupKey]?.[nestedKey] ?? fallback;
}

/** Normalizes precipitation kind against air temperature and supplied intensity. */
function precipitationKind(input, temperatureC, intensity) {
	if (!(intensity > 0.001)) return "none";
	const requested = String(input || "auto").toLowerCase();
	if (requested !== "auto" && requested !== "none") return requested;
	if (temperatureC <= -1.5) return "snow";
	if (temperatureC <= 1.5) return "mixed";
	return "rain";
}

/** Creates one immutable atmospheric state from partial or already-canonical inputs. */
export function createWeatherState(input = {}) {
	const temperatureC = clampWeather(input.temperatureC ?? 18, -90, 60);
	const precipitationRate = clampWeather(
		nested(input, "precipitationRate", "precipitation", "rateMmPerHour", 0),
		0,
		500
	);
	const windAngle = Number(nested(input, "windAngle", "wind", "angle", 0)) || 0;
	const windSpeed = clampWeather(nested(input, "windSpeed", "wind", "speedMetersPerSecond", 2), 0, 150);
	const windGust = clampWeather(nested(input, "windGust", "wind", "gustMetersPerSecond", windSpeed), windSpeed, 180);
	return Object.freeze({
		temperatureC,
		pressureHpa: clampWeather(input.pressureHpa ?? 1013.25, 850, 1085),
		humidity: clampWeather(input.humidity ?? 0.55, 0, 1),
		cloudCover: clampWeather(input.cloudCover ?? 0.25, 0, 1),
		cloudBaseMeters: clampWeather(input.cloudBaseMeters ?? 1800, 0, 18000),
		visibilityMeters: clampWeather(input.visibilityMeters ?? 30000, 20, 200000),
		precipitation: Object.freeze({
			kind: precipitationKind(
				input.precipitationKind ?? input.precipitation?.kind,
				temperatureC,
				precipitationRate
			),
			rateMmPerHour: precipitationRate,
			convective: Boolean(input.convective ?? input.precipitation?.convective),
			hailFraction: clampWeather(
				input.hailFraction ?? input.precipitation?.hailFraction ?? 0,
				0,
				1
			)
		}),
		wind: Object.freeze({
			angle: windAngle,
			direction: weatherDirection(windAngle),
			speedMetersPerSecond: windSpeed,
			gustMetersPerSecond: windGust,
			turbulence: clampWeather(
				input.turbulence ?? input.wind?.turbulence ?? 0.15,
				0,
				1
			)
		}),
		lightningActivity: clampWeather(input.lightningActivity ?? 0, 0, 1),
		instability: clampWeather(input.instability ?? 0.15, 0, 1),
		windShear: clampWeather(input.windShear ?? 0.1, 0, 1),
		fogDensity: clampWeather(input.fogDensity ?? 0, 0, 1),
		source: String(input.source || "procedural"),
		confidence: clampWeather(input.confidence ?? 1, 0, 1)
	});
}

/** Returns a concise immutable clear-weather baseline for callers without climate data. */
export function createClearWeatherState(overrides = {}) {
	return createWeatherState({
		cloudCover: 0.1,
		humidity: 0.45,
		visibilityMeters: 50000,
		...overrides
	});
}
