//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file WeatherObservation.js
 * @description Normalizes provider observations and blends them into procedural weather without coupling Core to one API.
 * Realtime weather is optional input: structural simulation remains playable, deterministic, and offline-safe without a network.
 */

import { clampWeather, lerpWeather } from "./WeatherMath.js";
import { createWeatherState } from "./WeatherState.js";

/** Converts a generic provider payload into the neutral Awtsmoos observation contract. */
export function normalizeWeatherObservation(input = {}) {
	return Object.freeze({
		observedAt: Number(input.observedAt ?? Date.now()),
		temperatureC: Number(input.temperatureC ?? input.temperature ?? 18),
		pressureHpa: Number(input.pressureHpa ?? input.pressure ?? 1013.25),
		humidity: clampWeather(input.humidity ?? 0.55, 0, 1),
		cloudCover: clampWeather(input.cloudCover ?? 0.25, 0, 1),
		precipitationRate: clampWeather(input.precipitationRate ?? input.precipitation ?? 0, 0, 500),
		precipitationKind: String(input.precipitationKind || "auto"),
		windAngle: Number(input.windAngle ?? 0),
		windSpeed: clampWeather(input.windSpeed ?? 2, 0, 150),
		windGust: clampWeather(input.windGust ?? input.windSpeed ?? 2, 0, 180),
		visibilityMeters: clampWeather(input.visibilityMeters ?? 30000, 20, 200000),
		lightningActivity: clampWeather(input.lightningActivity ?? 0, 0, 1),
		source: String(input.source || "external-observation"),
		confidence: clampWeather(input.confidence ?? 1, 0, 1)
	});
}

/** Blends one trusted observation into a procedural baseline while preserving bounded local simulation. */
export function assimilateWeatherObservation(proceduralState, observationInput, strength = 1) {
	const base = createWeatherState(proceduralState || {});
	const observation = normalizeWeatherObservation(observationInput);
	const alpha = clampWeather(strength, 0, 1) * observation.confidence;
	return createWeatherState({
		temperatureC: lerpWeather(base.temperatureC, observation.temperatureC, alpha),
		pressureHpa: lerpWeather(base.pressureHpa, observation.pressureHpa, alpha),
		humidity: lerpWeather(base.humidity, observation.humidity, alpha),
		cloudCover: lerpWeather(base.cloudCover, observation.cloudCover, alpha),
		precipitationRate: lerpWeather(base.precipitation.rateMmPerHour, observation.precipitationRate, alpha),
		precipitationKind: alpha > 0.5 ? observation.precipitationKind : base.precipitation.kind,
		windAngle: lerpWeather(base.wind.angle, observation.windAngle, alpha),
		windSpeed: lerpWeather(base.wind.speedMetersPerSecond, observation.windSpeed, alpha),
		windGust: lerpWeather(base.wind.gustMetersPerSecond, observation.windGust, alpha),
		visibilityMeters: lerpWeather(base.visibilityMeters, observation.visibilityMeters, alpha),
		lightningActivity: lerpWeather(base.lightningActivity, observation.lightningActivity, alpha),
		instability: base.instability,
		windShear: base.windShear,
		turbulence: base.wind.turbulence,
		source: `hybrid:${observation.source}`,
		confidence: Math.max(base.confidence, observation.confidence * alpha)
	});
}
