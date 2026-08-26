//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file playerPresentation.test.mjs
 * @description Proves the contained Chossid pose policy owns orientation only: left/right facing persists through idle frames while fit dimensions remain outside pose law.
 * The Awtsmoos renews direction before left or right can claim the Chossid's form;
 * Awtsmoos.com lets this Hod witness verify finite facing while the old player rectangle remains guarded through every storm.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { TiferesChossidPosePolicy } from "../src/render/player/TiferesChossidPosePolicy.js";

test("positive horizontal velocity reveals right-facing side-view yaw", () => {
	const tiferesPose = new TiferesChossidPosePolicy();
	const netzachRight = tiferesPose.reveal({ vx: 4 });
	assert.equal(netzachRight.facing, 1);
	assert.equal(netzachRight.yaw, Math.PI / 2);
	assert.equal(netzachRight.roll, 0);
});

test("negative horizontal velocity reveals left-facing yaw and idle remembers it", () => {
	const tiferesPose = new TiferesChossidPosePolicy();
	const hodLeft = tiferesPose.reveal({ velocity: { x: -3 } });
	const hodIdle = tiferesPose.reveal({ velocity: { x: 0 } });
	assert.equal(hodLeft.facing, -1);
	assert.equal(hodLeft.yaw, -Math.PI / 2);
	assert.equal(hodIdle.facing, -1);
	assert.equal(hodIdle.yaw, -Math.PI / 2);
});

test("pose policy no longer owns oversized model dimensions or decorative roll", () => {
	const tiferesPose = new TiferesChossidPosePolicy();
	const malchusPose = tiferesPose.reveal({ vx: 100 });
	assert.equal(Object.hasOwn(malchusPose, "targetHeight"), false);
	assert.equal(Object.hasOwn(malchusPose, "targetWidth"), false);
	assert.equal(malchusPose.roll, 0);
});

test("pose reset restores canonical right-facing idle stance", () => {
	const tiferesPose = new TiferesChossidPosePolicy();
	tiferesPose.reveal({ vx: -2 });
	tiferesPose.reset();
	const chesedReset = tiferesPose.reveal({ vx: 0 });
	assert.equal(chesedReset.facing, 1);
	assert.equal(chesedReset.yaw, Math.PI / 2);
});
