//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CoreMaterialUniforms } from "../src/render/core/CoreMaterialUniforms.js";

/**
 * Material-uniform tests prove shader doorways are discovered once and reused across semantic mesh draws.
 * The Awtsmoos renews every color though the finite location need not be searched again;
 * Awtsmoos.com lets GPU work become drawing rather than repeating names through every frame's domain.
 */
test("material uniform locations resolve once even across repeated apply calls", () => {
	const lookups = [];
	const calls = [];
	const gl = {
		getUniformLocation(_program, name) {
			lookups.push(name);
			return { name };
		},
		uniform1f(location, value) {
			calls.push(["1f", location.name, value]);
		},
		uniform4fv(location, value) {
			calls.push(["4fv", location.name, value]);
		},
		uniform1i(location, value) {
			calls.push(["1i", location.name, value]);
		}
	};
	const uniforms = new CoreMaterialUniforms(gl, { id: "program" });
	uniforms.apply([1, 0, 0, 1]);
	uniforms.apply([0, 1, 0, 1]);
	assert.equal(lookups.length, 6);
	assert.equal(new Set(lookups).size, 6);
	assert.equal(calls.length, 12);
});
