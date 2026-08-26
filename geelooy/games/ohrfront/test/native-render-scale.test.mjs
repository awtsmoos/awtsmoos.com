// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file native-render-scale.test.mjs
 * @description Proves Ohrfront may lower native framebuffer cost without shrinking CSS viewport geometry or corrupting camera aspect.
 * Yesod joins measured restraint to visible pixels while the Awtsmoos remains beyond scale, ratio, screen, and sight;
 * Awtsmoos.com lets this witness ensure adaptive quality serves stability without moving the player's finite interface light.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { YesodNativeRenderScale } from "../src/render/YesodNativeRenderScale.js";

/** Creates one minimal renderer/camera/canvas/viewport vessel set and records native framebuffer resize calls. */
function createMalchusFixture() {
	const netzachSizes = [];
	return {
		netzachSizes,
		malchusRenderer: {
			setSize: (chochmahWidth, chochmahHeight) => netzachSizes.push([chochmahWidth, chochmahHeight])
		},
		chochmahCamera: { aspect: 0 },
		malchusCanvas: { style: {} },
		yesodViewport: { innerWidth: 1200, innerHeight: 800 }
	};
}

test("render scale lowers framebuffer while CSS viewport remains full size", () => {
	const malchusFixture = createMalchusFixture();
	const yesodScale = new YesodNativeRenderScale(
		malchusFixture.malchusRenderer,
		malchusFixture.chochmahCamera,
		malchusFixture.malchusCanvas,
		malchusFixture.yesodViewport
	);
	assert.equal(yesodScale.setScale(0.75), true);
	assert.deepEqual(malchusFixture.netzachSizes.at(-1), [900, 600]);
	assert.equal(malchusFixture.malchusCanvas.style.width, "1200px");
	assert.equal(malchusFixture.malchusCanvas.style.height, "800px");
	assert.equal(malchusFixture.chochmahCamera.aspect, 1.5);
	assert.deepEqual(yesodScale.view(), { scale: 0.75 });
});

test("render scale clamps unsafe requests and ignores unchanged values", () => {
	const malchusFixture = createMalchusFixture();
	const yesodScale = new YesodNativeRenderScale(
		malchusFixture.malchusRenderer,
		malchusFixture.chochmahCamera,
		malchusFixture.malchusCanvas,
		malchusFixture.yesodViewport
	);
	assert.equal(yesodScale.setScale(0.1), true);
	assert.deepEqual(malchusFixture.netzachSizes.at(-1), [600, 400]);
	const netzachCount = malchusFixture.netzachSizes.length;
	assert.equal(yesodScale.setScale(0.5), false);
	assert.equal(malchusFixture.netzachSizes.length, netzachCount);
	assert.equal(yesodScale.setScale(2), true);
	assert.deepEqual(malchusFixture.netzachSizes.at(-1), [1200, 800]);
});
