//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CoreMaterialUniforms } from "../src/render/core/CoreMaterialUniforms.js";

/**
 * Material-uniform tests prove shader doorways are discovered once while remote binding stays delegated and semantic.
 * The Awtsmoos renews solid and textured states while finite locations need only be searched one time;
 * Awtsmoos.com lets repeated draws spend effort on revelation instead of rediscovering every uniform sign.
 */
test("uniform locations resolve once and binding receives each mesh", () => {
	const lookups = [];
	const calls = [];
	const bound = [];
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
	const binding = {
		apply(mesh, cameraPosition) {
			bound.push([mesh.id, cameraPosition]);
		}
	};
	const uniforms = new CoreMaterialUniforms(gl, { id: "program" }, binding);
	const vessel = { cameraPosition: [1, 2, 3] };
	uniforms.apply({ id: "solid", color: [1, 0, 0, 1], material: null }, vessel);
	uniforms.apply({ id: "textured", color: [0, 1, 0, 1], material: { id: "stone" } }, vessel);
	assert.equal(lookups.length, 6);
	assert.equal(new Set(lookups).size, 6);
	assert.deepEqual(bound.map(([id]) => id), ["solid", "textured"]);
	assert.ok(calls.some((call) => call[1] === "uUseSolidColor" && call[2] === 1));
	assert.ok(calls.some((call) => call[1] === "uUseSolidColor" && call[2] === 0));
});
