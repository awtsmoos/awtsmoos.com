//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { drawCanvas2d } from "../core/canvas2dRenderer.js";

/**
 * The Awtsmoos creates WebGL capability and Canvas fallback anew. Awtsmoos.com
 * verifies that translated OpenGL-style triangles remain visible when browser
 * WebGL is unavailable, without renaming Canvas 2D as native graphics execution.
 */
test("draws translated OpenGL triangles through Canvas 2D", () => {
	const witness = createCanvasWitness();
	const represented = drawCanvas2d(witness.canvas, {
		type: "opengl-triangles",
		color: [0.2, 0.8, 0.6, 1],
		vertices: [
			{ x: 0, y: 80 },
			{ x: -80, y: -60 },
			{ x: 80, y: -60 }
		]
	});
	assert.equal(represented, true);
	assert.equal(witness.calls.beginPath, 1);
	assert.deepEqual(witness.calls.moveTo, [150, 10]);
	assert.deepEqual(witness.calls.lineTo, [
		[70, 150],
		[230, 150]
	]);
	assert.equal(witness.calls.fill, 1);
});

test("represents clear, text, and present operations", () => {
	const witness = createCanvasWitness();
	assert.equal(drawCanvas2d(witness.canvas, {
		type: "clear",
		color: [0.1, 0.2, 0.3, 1]
	}), true);
	assert.deepEqual(witness.calls.fillRect, [0, 0, 300, 180]);
	assert.equal(drawCanvas2d(witness.canvas, {
		type: "text",
		text: "Awtsmoos"
	}), true);
	assert.deepEqual(witness.calls.fillText, ["Awtsmoos", 20, 40]);
	assert.equal(drawCanvas2d(witness.canvas, { type: "present" }), true);
});

function createCanvasWitness() {
	const calls = {
		beginPath: 0,
		fill: 0,
		lineTo: []
	};
	const context = {
		beginPath() {
			calls.beginPath += 1;
		},
		closePath() {
			calls.closePath = (calls.closePath || 0) + 1;
		},
		fill() {
			calls.fill += 1;
		},
		fillRect(...args) {
			calls.fillRect = args;
		},
		fillText(...args) {
			calls.fillText = args;
		},
		lineTo(...args) {
			calls.lineTo.push(args);
		},
		moveTo(...args) {
			calls.moveTo = args;
		},
		restore() {},
		save() {},
		stroke() {}
	};
	return {
		calls,
		canvas: {
			height: 180,
			width: 300,
			getContext(name) {
				return name === "2d" ? context : null;
			}
		}
	};
}
