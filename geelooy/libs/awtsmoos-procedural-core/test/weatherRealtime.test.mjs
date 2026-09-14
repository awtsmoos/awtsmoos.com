//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file weatherRealtime.test.mjs
 * @description Verifies provider-neutral realtime assimilation without creating a network dependency inside Procedural Core.
 */

import assert from "node:assert/strict";
import {
	WeatherSimulator,
	createWeatherPreset,
	normalizeWeatherObservation
} from "../src/core/weather/index.js";

const observation = normalizeWeatherObservation({
	temperatureC: 7,
	pressureHpa: 998,
	humidity: 0.96,
	cloudCover: 1,
	precipitationRate: 9,
	precipitationKind: "rain",
	windAngle: Math.PI,
	windSpeed: 11,
	windGust: 19,
	visibilityMeters: 4000,
	source: "fixture-provider"
});

const procedural = new WeatherSimulator({ base: createWeatherPreset("sunny") });
const realtime = new WeatherSimulator({
	base: createWeatherPreset("sunny"),
	mode: "realtime",
	observation
});

const local = realtime.regionalState();
assert.ok(Math.abs(local.temperatureC - 7) < 0.001);
assert.ok(Math.abs(local.pressureHpa - 998) < 0.001);
assert.ok(Math.abs(local.humidity - 0.96) < 0.001);
assert.equal(local.precipitation.kind, "rain");
assert.ok(local.precipitation.rateMmPerHour > 8.9);
assert.match(local.source, /^hybrid:/);

const offline = procedural.sample({ x: 25, z: -40 });
assert.ok(Number.isFinite(offline.temperatureC));
assert.equal(procedural.observation, null);

realtime.setObservation(null);
const fallback = realtime.regionalState();
assert.equal(fallback.source, createWeatherPreset("sunny").source);
assert.ok(fallback.precipitation.rateMmPerHour < local.precipitation.rateMmPerHour);

console.log('B"H | weatherRealtime.test.mjs passed');
