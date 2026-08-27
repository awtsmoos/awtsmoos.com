//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createFrameworkAndroidGraphicsMethods } from "../core/android/frameworkAndroidGraphics.js";
import { createAndroidMatrixFixture, record, RECT_F } from "./androidMatrixFixture.mjs";

/** Proves point and vector arrays mutate through distinct translation rules. */
test("Matrix maps points with translation and vectors without it", () => {
	const fixture = createAndroidMatrixFixture();
	const matrix = fixture.matrix();
	fixture.call("setTranslate", "(FF)V", [matrix, 7, -2]);
	const points = fixture.array([1, 2, -1, 3]);
	const vectors = fixture.array([1, 2, -1, 3]);
	fixture.call("mapPoints", "([F)V", [matrix, points]);
	fixture.call("mapVectors", "([F)V", [matrix, vectors]);
	assert.deepEqual(fixture.readArray(points), [8, 0, 6, 1]);
	assert.deepEqual(fixture.readArray(vectors), [1, 2, -1, 3]);
	assert.throws(() => fixture.call("mapPoints", "([F)V", [matrix, fixture.array([1])]), /ANDROID_MATRIX_ARRAY_LENGTH/);
});

test("Matrix maps all RectF corners and reports rect preservation", () => {
	const fixture = createAndroidMatrixFixture();
	const matrix = fixture.matrix();
	fixture.call("postScale", "(FF)Z", [matrix, 2, 3]);
	fixture.call("postTranslate", "(FF)Z", [matrix, 4, 5]);
	const rect = fixture.rect(1, 2, 3, 4);
	assert.equal(fixture.call("mapRect", `(Landroid/graphics/RectF;)Z`, [matrix, rect]), 1);
	assert.deepEqual(readRect(fixture, rect), [6, 11, 10, 17]);
	const skew = fixture.array([1, 1, 0, 0, 1, 0, 0, 0, 1]);
	fixture.call("setValues", "([F)V", [matrix, skew]);
	assert.equal(fixture.call("mapRect", `(Landroid/graphics/RectF;)Z`, [matrix, rect]), 0);
});

test("graphics composition routes Matrix before existing families", () => {
	const fixture = createAndroidMatrixFixture();
	const graphics = createFrameworkAndroidGraphicsMethods(fixture.runtime);
	assert.equal(graphics.canHandle(record("<init>", "()V")), true);
	const matrix = fixture.heap.allocate("Landroid/graphics/Matrix;");
	graphics.invoke(record("<init>", "()V"), [matrix]);
	assert.equal(graphics.invoke(record("isIdentity", "()Z"), [matrix]), 1);
});

function readRect(fixture, reference) {
	return ["left", "top", "right", "bottom"].map(name => {
		return fixture.heap.getField(reference, `${RECT_F}->${name}:F`);
	});
}
