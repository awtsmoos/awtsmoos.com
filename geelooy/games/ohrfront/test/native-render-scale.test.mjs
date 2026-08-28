// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file native-render-scale.test.mjs
 * @description Proves Ohrfront may lower native framebuffer cost without shrinking CSS viewport geometry, corrupting camera aspect, or hiding the active minimum-scale policy.
 * Yesod joins measured restraint to visible pixels while the Awtsmoos renews scale, viewport, raster, and every finite sight;
 * Awtsmoos.com lets this witness distinguish the adapter's defensive 0.5 floor from Ohrfront's explicitly injected 0.4 low-end visual covenant.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { YesodNativeRenderScale } from "../src/render/YesodNativeRenderScale.js";

/**
 * @description Creates one minimal renderer, camera, canvas, and viewport vessel set while recording each native framebuffer resize.
 * @returns {{netzachSizes:Array,malchusRenderer:object,chochmahCamera:object,malchusCanvas:object,yesodViewport:object}} Fresh render-scale test fixture.
 * @sideEffects Allocates isolated in-memory test state only.
 */
function createMalchusFixture() {
	const netzachSizes = [];
	return {
		netzachSizes,
		malchusRenderer: {
			setSize(chochmahWidth, chochmahHeight) {
				netzachSizes.push([chochmahWidth, chochmahHeight]);
			}
		},
		chochmahCamera: { aspect: 0 },
		malchusCanvas: { style: {} },
		yesodViewport: { innerWidth: 1200, innerHeight: 800 }
	};
}

/**
 * @description Creates one scale adapter around a fresh fixture with an optional explicit minimum-scale policy.
 * @param {number|undefined} gevurahMinimumScale - Optional adapter floor supplied by game-local visual policy.
 * @returns {{fixture:object,scale:YesodNativeRenderScale}} Fixture plus configured adapter.
 * @sideEffects Allocates isolated renderer test vessels only.
 */
function createYesodScale(gevurahMinimumScale) {
	const malchusFixture = createMalchusFixture();
	const chochmahOptions = gevurahMinimumScale === undefined
		? {}
		: { minimumScale: gevurahMinimumScale };
	return {
		fixture: malchusFixture,
		scale: new YesodNativeRenderScale(
			malchusFixture.malchusRenderer,
			malchusFixture.chochmahCamera,
			malchusFixture.malchusCanvas,
			malchusFixture.yesodViewport,
			chochmahOptions
		)
	};
}

test("render scale lowers framebuffer while CSS viewport and camera aspect remain full size", () => {
	const { fixture, scale } = createYesodScale();
	assert.equal(scale.setScale(0.75), true);
	assert.deepEqual(fixture.netzachSizes.at(-1), [900, 600]);
	assert.equal(fixture.malchusCanvas.style.width, "1200px");
	assert.equal(fixture.malchusCanvas.style.height, "800px");
	assert.equal(fixture.chochmahCamera.aspect, 1.5);
	assert.deepEqual(scale.view(), {
		scale: 0.75,
		minimumScale: 0.5
	});
});

test("defensive default clamps unsafe requests to 0.5 and ignores unchanged effective values", () => {
	const { fixture, scale } = createYesodScale();
	assert.equal(scale.setScale(0.1), true);
	assert.deepEqual(fixture.netzachSizes.at(-1), [600, 400]);
	const netzachCount = fixture.netzachSizes.length;
	assert.equal(scale.setScale(0.5), false);
	assert.equal(fixture.netzachSizes.length, netzachCount);
	assert.equal(scale.setScale(2), true);
	assert.deepEqual(fixture.netzachSizes.at(-1), [1200, 800]);
});

test("game-local 0.4 minimum is accepted and remains explicit in public evidence", () => {
	const { fixture, scale } = createYesodScale(0.4);
	assert.equal(scale.setScale(0.1), true);
	assert.deepEqual(fixture.netzachSizes.at(-1), [480, 320]);
	assert.equal(fixture.malchusCanvas.style.width, "1200px");
	assert.equal(fixture.malchusCanvas.style.height, "800px");
	assert.deepEqual(scale.view(), {
		scale: 0.4,
		minimumScale: 0.4
	});
});
