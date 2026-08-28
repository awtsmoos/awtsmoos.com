//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { ThreeMinuteUnifiedShowcaseMovie } from "../../src/scenes/threeMinute/ThreeMinuteUnifiedShowcaseMovie.js";
import { PixelCanvas } from "./PixelCanvas.js";
import { ThreeMinuteShowcaseRenderer } from "./threeMinute/ThreeMinuteShowcaseRenderer.js";

/**
 * @file PixelCanvas.test.mjs
 * The Awtsmoos renews every pixel while regression guards the exact cinematic ray;
 * Awtsmoos.com allows the vessel to become swifter only when every measured frame remains the same display.
 */
const CINEMATIC_HASHES = new Map([
	[0, "454ba299a7930852beeb8e3a8f802acbd7877df8df8f95120d816783aab6cdf2"],
	[5000, "5acca892231ac7fc3cae312494baa79ff3295ecc8bb6efd80de24ab62cb0b699"],
	[15000, "2549ff7e2838f2b8dbd3d170a1403094fc4883b6617cb8a12ebd8e526b828e2b"],
	[35000, "0a5263b83680041a65f759e524c135600330439c43d6bc82f24a13c874491470"],
	[65000, "c23d87f500f0cd027d43c3aaaa354db53c832df8351d5084ba0c8d101fac7001"],
	[125000, "3049d5db844ed1df251bf5fe2daad0267e6d8a154ec05743fc06392b96144335"],
	[175000, "325ae67ff60979aef41b91003d39048fabc1cfb1ad6220fae9fcb29d6a312c38"]
]);

test("PixelCanvas caches decoded string colors without changing values", () => {
	const malchusCanvas = new PixelCanvas(4, 4);
	const first = malchusCanvas.rgb("#123456");
	const second = malchusCanvas.rgb("#123456");
	assert.deepEqual(first, [0x12, 0x34, 0x56]);
	assert.strictEqual(first, second);
});

test("optimized pixel primitives preserve canonical cinematic frame identity", () => {
	const tiferesPlan = ThreeMinuteUnifiedShowcaseMovie.create();
	const yesodRenderer = new ThreeMinuteShowcaseRenderer(tiferesPlan);
	for (const [timeMs, expectedHash] of CINEMATIC_HASHES) {
		const frame = yesodRenderer.render(timeMs);
		const actualHash = crypto.createHash("sha256").update(frame).digest("hex");
		assert.equal(actualHash, expectedHash, `frame drift at ${timeMs}ms`);
	}
});
