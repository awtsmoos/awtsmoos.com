//B"H //Boruch Hashem //Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createAndroidMatrixFixture, record } from "./androidMatrixFixture.mjs";

const VALUES = "([F)V";

/** Proves identity, copy, values, and ordered transform composition. */
test("Matrix constructors and value exchange preserve independent state", () => {
	const fixture = createAndroidMatrixFixture();
	const first = fixture.matrix();
	assert.equal(fixture.call("isIdentity", "()Z", [first]), 1);
	const values = fixture.array([2, 0, 4, 0, 3, 5, 0, 0, 1]);
	fixture.call("setValues", VALUES, [first, values]);
	const copy = fixture.matrix(first);
	fixture.call("reset", "()V", [first]);
	const output = fixture.array(Array(9).fill(0));
	fixture.call("getValues", VALUES, [copy, output]);
	assert.deepEqual(fixture.readArray(output), [2, 0, 4, 0, 3, 5, 0, 0, 1]);
	assert.equal(fixture.call("isIdentity", "()Z", [first]), 1);
	assert.equal(fixture.call("isIdentity", "()Z", [copy]), 0);
});

test("post and pre transforms preserve Android multiplication order", () => {
	const fixture = createAndroidMatrixFixture();
	const matrix = fixture.matrix();
	fixture.call("setTranslate", "(FF)V", [matrix, 2, 3]);
	fixture.call("postScale", "(FF)Z", [matrix, 4, 5]);
	const points = fixture.array([1, 1]);
	fixture.call("mapPoints", "([F)V", [matrix, points]);
	assert.deepEqual(fixture.readArray(points), [12, 20]);
	fixture.call("reset", "()V", [matrix]);
	fixture.call("postTranslate", "(FF)Z", [matrix, 2, 3]);
	fixture.call("preScale", "(FF)Z", [matrix, 4, 5]);
	const second = fixture.array([1, 1]);
	fixture.call("mapPoints", "([F)V", [matrix, second]);
	assert.deepEqual(fixture.readArray(second), [6, 8]);
});

test("pivot rotation and preConcat use real 3x3 algebra", () => {
	const fixture = createAndroidMatrixFixture();
	const matrix = fixture.matrix();
	fixture.call("postRotate", "(FFF)Z", [matrix, 90, 1, 1]);
	const points = fixture.array([2, 1]);
	fixture.call("mapPoints", "([F)V", [matrix, points]);
	assert.ok(Math.abs(fixture.readArray(points)[0] - 1) < 1e-7);
	assert.ok(Math.abs(fixture.readArray(points)[1] - 2) < 1e-7);
	const translation = fixture.matrix();
	fixture.call("setTranslate", "(FF)V", [translation, 3, 0]);
	fixture.call("preConcat", "(Landroid/graphics/Matrix;)Z", [matrix, translation]);
	assert.equal(fixture.call("isIdentity", "()Z", [matrix]), 0);
});

test("Matrix owns exactly the sixteen authentic signatures", () => {
	const fixture = createAndroidMatrixFixture();
	assert.equal(fixture.family.canHandle(record("<init>", "()V")), true);
	assert.equal(fixture.family.canHandle(record("invert", "(Landroid/graphics/Matrix;)Z")), false);
	assert.throws(() => fixture.call("setValues", VALUES, [fixture.matrix(), fixture.array([1])]), /ANDROID_MATRIX_ARRAY_LENGTH/);
});
