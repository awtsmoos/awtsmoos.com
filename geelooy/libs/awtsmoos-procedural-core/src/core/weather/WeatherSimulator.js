//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file WeatherSimulator.js
 * @description Coordinates procedural, hybrid, and realtime-observation weather without owning any renderer or network client.
 * Consumers may advance world time, replace fronts, assimilate observations, and sample exact coordinates deterministically.
 */

import { clampWeather } from "./WeatherMath.js";
import { sampleWeatherField } from "./WeatherField.js";
import {
	assimilateWeatherObservation,
	normalizeWeatherObservation
} from "./WeatherObservation.js";
import { createWeatherState } from "./WeatherState.js";
import { createWeatherCoupling } from "./WeatherCoupling.js";

/** Normalizes the three supported observation policies. */
function normalizeMode(value) {
	const mode = String(value || "procedural").toLowerCase();
	return ["procedural", "hybrid", "realtime"].includes(mode) ? mode : "procedural";
}

/** Stateful clock and authority around otherwise pure weather functions. */
export class WeatherSimulator {
	constructor(options = {}) {
		this.seed = Number(options.seed || 1);
		this.timeSeconds = Number(options.timeSeconds || 0);
		this.base = createWeatherState(options.base || {});
		this.fronts = Object.freeze([...(options.fronts || [])]);
		this.mode = normalizeMode(options.mode);
		this.observationBlend = clampWeather(options.observationBlend ?? 0.8, 0, 1);
		this.observation = options.observation
			? normalizeWeatherObservation(options.observation)
			: null;
	}

	/** Advances simulation time without generating visual particles or expensive world objects. */
	advance(deltaSeconds) {
		this.timeSeconds += clampWeather(deltaSeconds, 0, 86400);
		return this;
	}

	/** Replaces the active moving fronts while preserving deterministic clock and climate state. */
	setFronts(fronts = []) {
		this.fronts = Object.freeze([...fronts]);
		return this;
	}

	/** Replaces optional realtime weather input without performing network access inside Core. */
	setObservation(observation = null) {
		this.observation = observation ? normalizeWeatherObservation(observation) : null;
		return this;
	}

	/** Resolves the current regional baseline according to procedural, hybrid, or realtime mode. */
	regionalState() {
		if (!this.observation || this.mode === "procedural") return this.base;
		const strength = this.mode === "realtime" ? 1 : this.observationBlend;
		return assimilateWeatherObservation(this.base, this.observation, strength);
	}

	/** Samples atmospheric state at a world X/Z coordinate. */
	sample(point = { x: 0, z: 0 }) {
		return sampleWeatherField({
			base: this.regionalState(),
			fronts: this.fronts,
			point,
			seed: this.seed,
			timeSeconds: this.timeSeconds
		});
	}

	/** Returns atmosphere plus neutral cross-system coupling for one coordinate. */
	sampleCoupled(point, surfaceMemory = {}) {
		const atmosphere = this.sample(point);
		return Object.freeze({ atmosphere, coupling: createWeatherCoupling(atmosphere, surfaceMemory) });
	}
}
