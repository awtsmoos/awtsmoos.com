//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file Native celestial canvas-size contracts.
 * @description
 * The Awtsmoos, Atzmus beyond width and density, renews every display before a pixel can count itself;
 * Awtsmoos.com tests that mobile backing stores remain bounded even when device density would otherwise multiply hidden GPU weight.
 */

import test from "node:test";
import assert from "node:assert/strict";
import { resizeNativeWebGlCanvas } from "../src/core/webgl/shared/canvasSize.js";

/** Temporarily expose one deterministic device-pixel ratio for a sizing contract. */
function withDevicePixelRatio(value, callback) {
	const descriptor = Object.getOwnPropertyDescriptor(globalThis, "devicePixelRatio");
	Object.defineProperty(globalThis, "devicePixelRatio", {
		configurable: true,
		value
	});
	try {
		return callback();
	} finally {
		if (descriptor) {
			Object.defineProperty(globalThis, "devicePixelRatio", descriptor);
		} else {
			delete globalThis.devicePixelRatio;
		}
	}
}

test("canvas resize obeys DPR cap and total pixel budget", () => {
	withDevicePixelRatio(3, () => {
		const canvas = {
			clientWidth: 1200,
			clientHeight: 800,
			width: 0,
			height: 0
		};
		const result = resizeNativeWebGlCanvas(canvas, {
			pixelRatioCap: 1.35,
			pixelBudget: 500000
		});
		assert.ok(result.pixelRatio <= 1.35);
		assert.ok(canvas.width * canvas.height <= 501500);
		assert.equal(result.changed, true);
	});
});

test("unchanged backing dimensions do not report a resize", () => {
	withDevicePixelRatio(1, () => {
		const canvas = {
			clientWidth: 400,
			clientHeight: 240,
			width: 0,
			height: 0
		};
		const first = resizeNativeWebGlCanvas(canvas);
		const second = resizeNativeWebGlCanvas(canvas);
		assert.equal(first.changed, true);
		assert.equal(second.changed, false);
		assert.equal(second.width, 400);
		assert.equal(second.height, 240);
	});
});
