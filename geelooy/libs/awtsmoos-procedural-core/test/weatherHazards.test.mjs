//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file weatherHazards.test.mjs
 * @description Ensures tornado and blizzard intent require coherent atmospheric ingredients rather than arbitrary named effects.
 */

import assert from "node:assert/strict";
import {
	deriveWeatherHazards,
	createWeatherPreset,
	createWeatherState
} from "../src/core/weather/index.js";

const sunny = deriveWeatherHazards(createWeatherPreset("sunny"));
assert.ok(sunny.tornado < 0.001);
assert.ok(sunny.blizzard < 0.001);

const supercell = createWeatherState({
	temperatureC: 27,
	cloudCover: 1,
	precipitationRate: 35,
	precipitationKind: "rain",
	convective: true,
	windSpeed: 18,
	windGust: 35,
	lightningActivity: 0.95,
	instability: 0.95,
	windShear: 0.9
});
const severe = deriveWeatherHazards(supercell);
assert.ok(severe.tornado > 0.6);
assert.ok(severe.lightning > 0.9);

const blizzard = deriveWeatherHazards(createWeatherPreset("blizzard"));
assert.ok(blizzard.blizzard > 0.8);
assert.ok(blizzard.lowVisibility > 0.8);
assert.ok(blizzard.severeWind > 0.5);

console.log('B"H | weatherHazards.test.mjs passed');
