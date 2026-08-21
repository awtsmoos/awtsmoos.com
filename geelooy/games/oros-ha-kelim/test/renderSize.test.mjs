//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CoreRenderSize } from "../src/render/core/CoreRenderSize.js";

/**
 * Render-size tests prove visual abundance follows the chosen quality measure exactly.
 * The Awtsmoos renews every pixel while Gevurah bounds its count for the screen;
 * Awtsmoos.com lets low and high vessels share one native core without an unseen extreme.
 */
test("measure applies bounded quality pixel ratio", () => {
	const container = { clientWidth: 320, clientHeight: 180 };
	assert.deepEqual(CoreRenderSize.measure(container, { pixelRatio: 1 }), {
		width: 320,
		height: 180,
		pixelRatio: 1
	});
	assert.deepEqual(CoreRenderSize.measure(container, { pixelRatio: 2 }), {
		width: 640,
		height: 360,
		pixelRatio: 2
	});
});

test("measure clamps excessive and tiny pixel ratio", () => {
	const container = { clientWidth: 100, clientHeight: 50 };
	assert.equal(CoreRenderSize.measure(container, { pixelRatio: 9 }).pixelRatio, 2);
	assert.equal(CoreRenderSize.measure(container, { pixelRatio: 0.1 }).pixelRatio, 0.5);
});

test("apply mutates canvas only when dimensions change", () => {
	const calls = [];
	const gl = { viewport: (...args) => calls.push(args) };
	const canvas = {
		width: 10,
		height: 10,
		parentElement: { clientWidth: 200, clientHeight: 100 }
	};
	const first = CoreRenderSize.apply(gl, canvas, { pixelRatio: 1 });
	const second = CoreRenderSize.apply(gl, canvas, { pixelRatio: 1 });
	assert.equal(first.changed, true);
	assert.equal(second.changed, false);
	assert.deepEqual(calls, [[0, 0, 200, 100]]);
});
