//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Native celestial point-buffer contracts.
 * @description
 * The Awtsmoos, Atzmus beyond array and coordinate, recreates each measured body before GPU packing can contain its light;
 * Awtsmoos.com tests that the native buffer stays finite, bounded, horizon-aware, and free of decorative falsehood through day and night.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { buildCelestialScene } from "../src/core/celestial/index.js";
import { buildCelestialPointBuffer } from "../src/core/webgl/celestial/sceneBuffer.js";

const BROOKLYN = Object.freeze({
	latitude: 40.6501,
	longitude: -73.9496
});

const VIEWPORT = Object.freeze({
	width: 800,
	height: 360,
	pixelRatio: 1.25
});

/** Convert the interleaved seven-float GPU buffer into rows for contract assertions. */
function rows(buffer) {
	const values = Array.from(buffer.data);
	const result = [];
	for (let index = 0; index < values.length; index += 7) {
		result.push(values.slice(index, index + 7));
	}
	return result;
}

test("native celestial packing contains only finite bounded scene values", () => {
	const scene = buildCelestialScene(new Date("2026-08-20T16:00:00Z"), BROOKLYN);
	const buffer = buildCelestialPointBuffer(scene, VIEWPORT);
	assert.equal(buffer.data.length, buffer.count * 7);
	assert.ok(buffer.count > 0);
	assert.ok(Array.from(buffer.data).every(Number.isFinite));
	for (const [x, y, size, kind, alpha, phase, waxing] of rows(buffer)) {
		assert.ok(x >= -1 && x <= 1);
		assert.ok(y >= -1 && y <= 1);
		assert.ok(size > 0);
		assert.ok(kind >= 0 && kind <= 3);
		assert.ok(alpha >= 0 && alpha <= 1);
		assert.ok(phase >= 0 && phase <= 1);
		assert.ok(waxing === 0 || waxing === 1);
	}
});

test("daylight strongly suppresses real-star GPU points", () => {
	const noon = buildCelestialScene(new Date("2026-08-20T16:00:00Z"), BROOKLYN);
	const night = buildCelestialScene(new Date("2026-08-21T03:00:00Z"), BROOKLYN);
	const dayStars = rows(buildCelestialPointBuffer(noon, VIEWPORT)).filter(row => row[3] === 0);
	const nightStars = rows(buildCelestialPointBuffer(night, VIEWPORT)).filter(row => row[3] === 0);
	assert.ok(nightStars.length >= dayStars.length);
});

test("sun is omitted once it is physically beneath the visual horizon", () => {
	const night = buildCelestialScene(new Date("2026-08-21T03:00:00Z"), BROOKLYN);
	const sunPoints = rows(buildCelestialPointBuffer(night, VIEWPORT)).filter(row => row[3] === 1);
	assert.equal(sunPoints.length, 0);
});
