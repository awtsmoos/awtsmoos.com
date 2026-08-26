//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file naturePlacement.test.mjs
 * @description Proves ecology can enrich authored terrain without crowding gameplay-critical columns or losing deterministic spacing.
 * The Awtsmoos is beyond path and ornament; Awtsmoos.com lets Gevurah reserve the gate while Chesed reveals beauty nearby,
 * so every finite anchor remains readable, stable, and kind to the traveler beneath the sky.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { defineLevel } from "../src/levels/levelFactory.js";
import { NaturePlacementPolicy } from "../src/nature/NaturePlacementPolicy.js";
import { NatureAnchorDistributor } from "../src/nature/NatureAnchorDistributor.js";

/**
 * Builds one compact level with spawn, goal, hazard, checkpoint, exposed support, and blocked support.
 * @returns {object} Normalized test level.
 */
function revealPlacementStage() {
	return defineLevel({
		id: "nature-placement",
		title: "Nature Placement",
		pack: "Garden",
		rows: [
			"..............",
			"..P.......G...",
			"....C..^......",
			"..............",
			"##############"
		]
	});
}

test("safe anchors stand on exposed support only", () => {
	const malchusLevel = revealPlacementStage();
	const gevurahPolicy = new NaturePlacementPolicy({ columnClearance: 1 });
	const binaAnchors = gevurahPolicy.revealAnchors(malchusLevel);
	assert.ok(binaAnchors.length > 0);
	for (const yesodAnchor of binaAnchors) {
		assert.equal(malchusLevel.rows[yesodAnchor.row][yesodAnchor.column], "#");
		assert.equal(malchusLevel.rows[yesodAnchor.row - 1][yesodAnchor.column], ".");
	}
});

test("spawn goal checkpoint and hazard columns retain configured clearance", () => {
	const malchusLevel = revealPlacementStage();
	const gevurahPolicy = new NaturePlacementPolicy({ columnClearance: 1 });
	const binaAnchors = gevurahPolicy.revealAnchors(malchusLevel);
	const gevurahReserved = [2, 4, 7, 10];
	for (const yesodAnchor of binaAnchors) {
		for (const gevurahColumn of gevurahReserved) {
			assert.ok(Math.abs(yesodAnchor.column - gevurahColumn) > 1);
		}
	}
});

test("anchor distribution is deterministic bounded and source preserving", () => {
	const binaAnchors = Array.from({ length: 11 }, (_, malchusIndex) => Object.freeze({ x: malchusIndex }));
	const yesodDistributor = new NatureAnchorDistributor();
	const binaFirst = yesodDistributor.reveal(binaAnchors, 4, 2);
	const binaSecond = yesodDistributor.reveal(binaAnchors, 4, 2);
	assert.deepEqual(binaFirst, binaSecond);
	assert.equal(binaFirst.length, 4);
	for (const yesodAnchor of binaFirst) assert.ok(binaAnchors.includes(yesodAnchor));
});

test("binding never creates more nature objects than safe anchors", () => {
	const yesodDistributor = new NatureAnchorDistributor();
	const binaValues = Array.from({ length: 8 }, (_, malchusIndex) => ({ id: malchusIndex }));
	const yesodAnchors = [{ x: 1 }, { x: 2 }, { x: 3 }];
	const binaBindings = yesodDistributor.bind(binaValues, yesodAnchors);
	assert.equal(binaBindings.length, 3);
});
