//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { createNativeGlesUniformState } from "../core/native/nativeGlesUniformState.js";

/** Proves declared scalar/array names receive stable synthetic locations after link. */
test("uniform state resolves only declared linked names", () => {
	const fixture = fakeObjects();
	const state = createNativeGlesUniformState(fixture.objects);
	const matrix = state.location(7, "uMvp", 1n);
	const colorBase = state.location(7, "colors", 1n);
	const colorZero = state.location(7, "colors[0]", 1n);
	assert.ok(matrix > 0);
	assert.ok(colorBase > 0);
	assert.equal(colorBase, colorZero);
	assert.equal(state.location(7, "colors[2]", 1n), -1);
	assert.equal(state.location(7, "missing", 1n), -1);
});

/** Proves a location is valid only while its owning program is the current GLES program. */
test("uniform values require the owning current program", () => {
	const fixture = fakeObjects();
	const state = createNativeGlesUniformState(fixture.objects);
	const location = state.location(7, "tint", 1n);
	assert.equal(state.set(location, "uniform4f", [1, 0.5, 0.25, 1], { kind: "f32" }, 1n), true);
	fixture.current.value = 8;
	assert.equal(state.set(location, "uniform4f", [0, 0, 0, 1], { kind: "f32" }, 1n), false);
	assert.equal(fixture.errors.at(-1), "invalidOperation");
	assert.equal(fixture.records.filter(record => record.kind === "uniform-value").length, 1);
});

/** Builds a linked program/shader object facade matching the real native object-state contract. */
function fakeObjects() {
	const records = [];
	const errors = [];
	const current = { value: 7 };
	const program = { attached: new Set([3]), handle: 7, linked: true };
	const shader = { source: "uniform highp mat4 uMvp; uniform vec4 colors[2]; uniform vec4 tint;" };
	const domain = {
		invalidOperation: () => errors.push("invalidOperation"),
		prepare: thread => Object.freeze({ context: 1n, thread: String(thread), valid: true })
	};
	const objects = {
		domain,
		program: handle => handle === 7 ? Object.freeze({ context: 1n, record: program, success: true }) : Object.freeze({ context: 1n, record: null, success: false }),
		record: (context, kind, payload) => records.push({ context, kind, ...payload }),
		shader: handle => handle === 3 ? Object.freeze({ context: 1n, record: shader, success: true }) : Object.freeze({ context: 1n, record: null, success: false }),
		snapshot: () => Object.freeze({ currentPrograms: Object.freeze([["1", current.value]]) })
	};
	return { current, errors, objects, records };
}
