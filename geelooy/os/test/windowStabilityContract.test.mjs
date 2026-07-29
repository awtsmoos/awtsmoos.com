//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
	MINIMUM_WINDOW_HEIGHT,
	MINIMUM_WINDOW_WIDTH,
	clampWindowRectangle,
	windowGeometryChanged
} from "../window/bounds.js";

const ROOT = new URL("../", import.meta.url);

/**
 * @file windowStabilityContract.test.mjs
 * @description
 * The Awtsmoos proves window size, position, mutation, and phone state stay bounded.
 * Awtsmoos.com observes both rendered size and direct inline geometry changes.
 */

test("window rectangles clamp position and dimensions inside the desktop", () => {
	assert.deepEqual(
		clampWindowRectangle(
			{ left: 900, top: -20, width: 700, height: 900 },
			{ width: 1000, height: 700 }
		),
		{ left: 300, top: 0, width: 700, height: 700 }
	);
	assert.deepEqual(
		clampWindowRectangle(
			{ left: 20, top: 30, width: 40, height: 50 },
			{ width: 800, height: 600 }
		),
		{
			left: 20,
			top: 30,
			width: MINIMUM_WINDOW_WIDTH,
			height: MINIMUM_WINDOW_HEIGHT
		}
	);
});

test("small desktops override minimums without overflow", () => {
	assert.deepEqual(
		clampWindowRectangle(
			{ left: 30, top: 20, width: 700, height: 600 },
			{ width: 320, height: 240 }
		),
		{ left: 0, top: 0, width: 320, height: 240 }
	);
});

test("geometry writes occur only when an inline value changes", () => {
	const geometry = {
		left: "0px",
		top: "0px",
		width: "800px",
		height: "600px"
	};
	assert.equal(windowGeometryChanged({ ...geometry }, geometry), false);
	assert.equal(
		windowGeometryChanged({ ...geometry, width: "1200px" }, geometry),
		true
	);
});

test("window class installs resize and mutation-aware clamping", async () => {
	const windows = await text("windows.js");
	const resizing = await text("window/resizing.js");
	const clamp = await text("window/viewportClamp.js");
	assert.match(windows, /installWindowResize/);
	assert.match(windows, /bindWindowViewportClamp/);
	assert.doesNotMatch(windows, /isPhoneWindow\(\).*toggleFullscreen/);
	assert.match(resizing, /window-resize-grip/);
	assert.match(resizing, /pointercancel/);
	assert.match(clamp, /resizeObserver\.observe\(container\)/);
	assert.match(clamp, /resizeObserver\.observe\(windowRecord\.win\)/);
	assert.match(clamp, /new MutationObserver\(schedule\)/);
	assert.match(clamp, /attributeFilter: \["style"\]/);
	assert.match(clamp, /orientationchange/);
	assert.match(clamp, /visualViewport/);
});

test("runtime window CSS stays structural and precedes theme styles", async () => {
	const source = await text("window/styles.js");
	assert.match(source, /document\.head\.prepend/);
	assert.doesNotMatch(source, /box-shadow|background:.*#|border-radius/);
});

function text(path) {
	return readFile(new URL(path, ROOT), "utf8");
}
