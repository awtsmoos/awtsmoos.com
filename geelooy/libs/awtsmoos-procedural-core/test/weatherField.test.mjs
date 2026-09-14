//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file weatherField.test.mjs
 * @description Proves that weather occupies world space, fronts move deterministically, and named regimes stay physically bounded.
 */

import assert from "node:assert/strict";
import {
	WeatherSimulator,
	classifyWeather,
	createWeatherFront,
	createWeatherPreset
} from "../src/core/weather/index.js";

const storm = createWeatherFront({
	id: "moving-storm",
	x: 0,
	z: 0,
	velocityX: 10,
	radiusMeters: 2000,
	edgeMeters: 500,
	cloudBoost: 0.85,
	precipitationRate: 22,
	lightningActivity: 0.7,
	instability: 0.8,
	windShear: 0.55,
	convective: true
});

const simulator = new WeatherSimulator({
	seed: 73,
	base: createWeatherPreset("sunny"),
	fronts: [storm]
});

const inside = simulator.sample({ x: 0, z: 0 });
const outside = simulator.sample({ x: 6000, z: 0 });
assert.ok(inside.precipitation.rateMmPerHour > 15);
assert.ok(inside.cloudCover > outside.cloudCover);
assert.equal(classifyWeather(inside), "thunderstorm");
assert.equal(classifyWeather(outside), "sunny");

const repeat = simulator.sample({ x: 0, z: 0 });
assert.deepEqual(repeat, inside, "same seed/time/point must be deterministic");

simulator.advance(250);
const oldCenter = simulator.sample({ x: 0, z: 0 });
const movedCenter = simulator.sample({ x: 2500, z: 0 });
assert.ok(movedCenter.precipitation.rateMmPerHour > oldCenter.precipitation.rateMmPerHour);

for (const state of [inside, outside, movedCenter]) {
	assert.ok(state.humidity >= 0 && state.humidity <= 1);
	assert.ok(state.cloudCover >= 0 && state.cloudCover <= 1);
	assert.ok(state.wind.gustMetersPerSecond >= state.wind.speedMetersPerSecond);
	assert.ok(Number.isFinite(state.temperatureC));
}

console.log('B"H | weatherField.test.mjs passed');
