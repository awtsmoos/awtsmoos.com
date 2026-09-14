//B"H
//Boruch Hashem
//Blessed be He

import assert from "node:assert/strict";
import test from "node:test";
import {
	queryNativeGlesUniform,
	resolveNativeGlesCurrentProgram
} from "../core/native/nativeGlesUniformQueryState.js";

/**
 * Proves current-program resolution supports both the new direct accessor and
 * the older immutable snapshot contract without changing guest-visible handles.
 */
test("current program resolver supports direct and snapshot object facades", () => {
	const direct = {
		current: () => 7,
		snapshot: () => ({ currentPrograms: [["1", 9]] })
	};
	const snapshotOnly = {
		snapshot: () => ({ currentPrograms: [["1", 9]] })
	};
	assert.equal(resolveNativeGlesCurrentProgram(direct, 1n), 7);
	assert.equal(resolveNativeGlesCurrentProgram(snapshotOnly, 1n), 9);
	assert.equal(resolveNativeGlesCurrentProgram({ snapshot: () => ({}) }, 1n), 0);
});

/**
 * Proves a linked declared vec4 reads GLES zero defaults until a successful
 * setter stores real guest values, after which queries return those values.
 */
test("uniform queries preserve typed defaults and stored values", () => {
	const fixture = createQueryFixture();
	const base = {
		byLocation: fixture.byLocation,
		locationValue: 12,
		objects: fixture.objects,
		program: 7,
		thread: 1n,
		valuesByLocation: fixture.valuesByLocation
	};
	const initial = queryNativeGlesUniform(base);
	assert.equal(initial.success, true);
	assert.equal(initial.kind, "float");
	assert.deepEqual(initial.values, [0, 0, 0, 0]);
	fixture.valuesByLocation.set(12, Object.freeze([1, 0.5, 0.25, 1]));
	const stored = queryNativeGlesUniform(base);
	assert.deepEqual(stored.values, [1, 0.5, 0.25, 1]);
});

/** Proves program ownership violations become GL_INVALID_OPERATION testimony. */
test("uniform query rejects a location owned by another program", () => {
	const fixture = createQueryFixture();
	const result = queryNativeGlesUniform({
		byLocation: fixture.byLocation,
		locationValue: 12,
		objects: fixture.objects,
		program: 8,
		thread: 1n,
		valuesByLocation: fixture.valuesByLocation
	});
	assert.equal(result.success, false);
	assert.equal(fixture.errors.at(-1), "invalidOperation");
});

/** Builds the smallest linked shader/program facade needed by the real parser. */
function createQueryFixture() {
	const errors = [];
	const byLocation = new Map([
		[12, Object.freeze({ name: "tint", program: 7 })]
	]);
	const valuesByLocation = new Map();
	const linked = Object.freeze({
		attached: new Set([3]),
		handle: 7,
		linked: true
	});
	const shader = Object.freeze({
		source: "uniform highp vec4 tint;"
	});
	const objects = Object.freeze({
		domain: Object.freeze({
			invalidOperation: () => errors.push("invalidOperation")
		}),
		program: handle => Object.freeze({
			record: handle === 7 || handle === 8 ? linked : null,
			success: handle === 7 || handle === 8
		}),
		shader: handle => Object.freeze({
			record: handle === 3 ? shader : null,
			success: handle === 3
		})
	});
	return {
		byLocation,
		errors,
		objects,
		valuesByLocation
	};
}
