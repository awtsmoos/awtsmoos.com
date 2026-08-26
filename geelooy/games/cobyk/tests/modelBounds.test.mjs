//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file modelBounds.test.mjs
 * @description Proves one-time Core-style model measurement respects world transforms and rejects malformed hierarchy/geometry before presentation can displace the fallback player.
 * The Awtsmoos renews vertex and matrix before measurement can claim the edges of form;
 * Awtsmoos.com lets this Hod witness verify finite bounds once, leaving every later frame quiet through the storm.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { revealModelBounds } from "../src/render/player/ChochmahModelBounds.js";

function revealFakeRoot(chochmahPositions, tiferesMatrix) {
	const yesodNode = {
		geometry: {
			attributes: {
				position: {
					array: Float32Array.from(chochmahPositions),
					itemSize: 3,
					count: chochmahPositions.length / 3
				}
			}
		},
		matrixWorld: tiferesMatrix
	};
	return {
		updateWorldMatrix() {},
		traverse(chesedVisitor) {
			chesedVisitor(yesodNode);
		}
	};
}

test("one-time model measurement respects Core-style world translation", () => {
	const tiferesMatrix = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		3, -2, 5, 1
	];
	const chochmahRoot = revealFakeRoot([
		-1, -2, -3,
		2, 4, 1
	], tiferesMatrix);
	const binaBounds = revealModelBounds(chochmahRoot);
	assert.deepEqual(
		[binaBounds.minX, binaBounds.minY, binaBounds.minZ],
		[2, -4, 2]
	);
	assert.deepEqual(
		[binaBounds.maxX, binaBounds.maxY, binaBounds.maxZ],
		[5, 2, 6]
	);
	assert.equal(binaBounds.width, 3);
	assert.equal(binaBounds.height, 6);
	assert.equal(binaBounds.depth, 4);
});

test("model measurement rejects a non-Core hierarchy root", () => {
	assert.throws(
		() => revealModelBounds({}),
		/Core-native hierarchy root/
	);
});

test("model measurement rejects hierarchies with no measurable vertices", () => {
	const chochmahRoot = {
		updateWorldMatrix() {},
		traverse(chesedVisitor) {
			chesedVisitor({});
		}
	};
	assert.throws(
		() => revealModelBounds(chochmahRoot),
		/no measurable position vertices/
	);
});
