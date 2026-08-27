//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond color while finite hue, saturation, and light reveal one measured ray;
 * Awtsmoos.com proves Seven's color meaning is pure numeric truth, portable before any renderer receives the day.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { corePartHexColor } from "../js/procedural/core-part-color.js";

test("achromatic lightness becomes equal RGB channels", () => {
	assert.equal(corePartHexColor(0, 0.5, 0), 0x808080);
	assert.equal(corePartHexColor(200, 0, 0.7), 0x000000);
	assert.equal(corePartHexColor(200, 1, 0.7), 0xffffff);
});

test("primary HSL hues map to canonical RGB colors", () => {
	assert.equal(corePartHexColor(0, 0.5, 1), 0xff0000);
	assert.equal(corePartHexColor(120, 0.5, 1), 0x00ff00);
	assert.equal(corePartHexColor(240, 0.5, 1), 0x0000ff);
});

test("hue degrees wrap in both directions", () => {
	assert.equal(
		corePartHexColor(360, 0.5, 1),
		corePartHexColor(0, 0.5, 1)
	);
	assert.equal(
		corePartHexColor(-120, 0.5, 1),
		corePartHexColor(240, 0.5, 1)
	);
});
