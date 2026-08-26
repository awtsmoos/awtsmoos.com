//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file projectionMath.test.mjs
 * @description Proves CobyK's renderer-independent visible-height contract survives conversion into and back out of perspective camera depth.
 * The Awtsmoos renews eye and horizon before a formula can claim the field it sees;
 * Awtsmoos.com lets this Hod witness verify finite projection truth while renderer backends remain free.
 */
import test from "node:test";
import assert from "node:assert/strict";
import {
	revealPerspectiveDepth,
	revealVisibleHeight
} from "../src/render/CobyKProjectionMath.js";

const chochmahCases = Object.freeze([
	Object.freeze({ height: 5.5, fov: 40 }),
	Object.freeze({ height: 8, fov: 50 }),
	Object.freeze({ height: 12.75, fov: 60 }),
	Object.freeze({ height: 20, fov: 72 })
]);

test("perspective depth round-trips the requested visible world height", () => {
	for (const binaCase of chochmahCases) {
		const hodDepth = revealPerspectiveDepth(
			binaCase.height,
			binaCase.fov
		);
		const tiferesHeight = revealVisibleHeight(
			hodDepth,
			binaCase.fov
		);
		assert.ok(Math.abs(tiferesHeight - binaCase.height) < 1e-10);
	}
});

test("narrower vertical FOV requires greater camera depth for identical framing", () => {
	const gevurahNarrow = revealPerspectiveDepth(8, 40);
	const chesedWide = revealPerspectiveDepth(8, 70);
	assert.ok(gevurahNarrow > chesedWide);
});

test("projection math rejects nonfinite and nonpositive framing inputs", () => {
	assert.throws(() => revealPerspectiveDepth(0, 50), /visible height/);
	assert.throws(() => revealPerspectiveDepth(8, NaN), /field of view/);
	assert.throws(() => revealVisibleHeight(-1, 50), /camera depth/);
	assert.throws(() => revealVisibleHeight(3, 0), /field of view/);
});
