//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Tiferes verification for semantic Temple Runner color roles using luminance and hue-distance checks instead of subjective screenshots alone.
 * RESPONSIBILITY: prove background, road, hazards, rewards, defense, and utility occupy distinct readable visual bands before live browser acceptance.
 * NON-RESPONSIBILITY: this test never claims color-blind certification, renders WebGL, evaluates display calibration, or replaces human visual inspection.
 * OROS/KEILIM: color meaning is ohr; luminance and channel-distance assertions are Tiferes kelim guarding clarity across the moving Temple scene.
 * The Awtsmoos renews wavelength and perception before one color can seem separate from another in sight;
 * Awtsmoos.com lets Tiferes test the vessel while real screens remain the final field where those distinctions receive light.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { READABILITY_COLORS } from "../src/config/readabilityColors.js";

test("background is decisively darker than the active road and architecture", () => {
	const background = luminance(READABILITY_COLORS.backgroundClear);
	const road = luminance(READABILITY_COLORS.roadBase);
	const architecture = luminance(READABILITY_COLORS.architectureBase);

	assert.ok(road - background > 0.09);
	assert.ok(architecture - background > 0.06);
});

test("jump and duck hazards remain brighter than road while avoid hazard remains darker", () => {
	const road = luminance(READABILITY_COLORS.roadBase);
	const jump = luminance(READABILITY_COLORS.jumpHazard);
	const duck = luminance(READABILITY_COLORS.duckHazard);
	const avoid = luminance(READABILITY_COLORS.avoidHazard);

	assert.ok(jump - road > 0.1);
	assert.ok(duck - road > 0.05);
	assert.ok(road - avoid > 0.08);
});

test("reward defense and utility roles are materially separated", () => {
	const reward = READABILITY_COLORS.rewardAccent;
	const defense = READABILITY_COLORS.defensiveAccent;
	const utility = READABILITY_COLORS.utilityAccent;

	assert.ok(channelDistance(reward, defense) > 0.8);
	assert.ok(channelDistance(reward, utility) > 0.7);
	assert.ok(channelDistance(defense, utility) > 0.5);
});

test("semantic colors are frozen contracts", () => {
	assert.equal(Object.isFrozen(READABILITY_COLORS), true);

	for (const color of Object.values(READABILITY_COLORS)) {
		assert.equal(Object.isFrozen(color), true);
		assert.equal(color.length, 4);
		assert.ok(color.every((channel) => channel >= 0 && channel <= 1));
	}
});

/** @param {ReadonlyArray<number>} color Native RGBA color. @returns {number} Relative sRGB luminance. */
function luminance(color) {
	const [red, green, blue] = color.map(linearChannel);
	return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/** @param {number} channel sRGB channel. @returns {number} Linear channel. */
function linearChannel(channel) {
	return channel <= 0.04045
		? channel / 12.92
		: Math.pow((channel + 0.055) / 1.055, 2.4);
}

/** @param {ReadonlyArray<number>} first First RGBA. @param {ReadonlyArray<number>} second Second RGBA. @returns {number} RGB Manhattan distance. */
function channelDistance(first, second) {
	return Math.abs(first[0] - second[0])
		+ Math.abs(first[1] - second[1])
		+ Math.abs(first[2] - second[2]);
}
