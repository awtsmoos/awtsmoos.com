//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file WeatherForecast.js
 * @description Samples future atmospheric states from the same deterministic moving fronts without advancing live simulation state.
 * Forecasts are therefore consistent with the world clock and can be consumed by NPCs, UI, or gameplay without hidden mutation.
 */

import { sampleWeatherField } from "./WeatherField.js";

/** Normalizes future offsets to finite non-negative seconds and bounded count. */
function normalizeOffsets(offsets = []) {
	return offsets
		.slice(0, 96)
		.map(value => Math.max(0, Number(value || 0)))
		.filter(Number.isFinite);
}

/** Returns a deterministic forecast timeline at one coordinate without changing the simulator. */
export function forecastWeatherTimeline(simulator, point = { x: 0, z: 0 }, offsets = []) {
	const base = simulator.regionalState();
	const time = Number(simulator.timeSeconds || 0);
	const timeline = normalizeOffsets(offsets).map(offsetSeconds => Object.freeze({
		offsetSeconds,
		timeSeconds: time + offsetSeconds,
		state: sampleWeatherField({
			base,
			fronts: simulator.fronts,
			point,
			seed: simulator.seed,
			timeSeconds: time + offsetSeconds
		})
	}));
	return Object.freeze(timeline);
}
