//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file underworldPlane.test.mjs
 * @description Proves the Netzach underworld plane (the earth that fills the
 * dead band below the terrain) faces the camera, spans every level, and can
 * never be hidden by winding, culling, or a missing attribute.
 * Yaakov 2026-10-13 round 2: the original index order [0,1,2, 0,2,3] wound
 * clockwise seen from +z, so the plane was back-facing and frustum-culled.
 * Yaakov 2026-10-13 round 3: the per-level plane still never painted in
 * Level 1's view — it is now one persistent static quad, never culled,
 * double-sided, with UVs.
 *
 * Run: node --import ./tests/support/cobykLibsRegister.mjs --test tests/underworldPlane.test.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";
import { NetzachUnderworldPlane } from "../src/render/NetzachUnderworldPlane.js";

test("underworld plane triangles wind counter-clockwise from the camera side", () => {
	const plane = new NetzachUnderworldPlane();
	const mesh = plane.reveal();
	const pos = mesh.geometry.attributes.position.array;
	const idx = Array.from(mesh.geometry.index.array);
	assert.equal(idx.length, 6, "plane is two triangles");
	for (let t = 0; t < idx.length; t += 3) {
		const [a, b, c] = [idx[t], idx[t + 1], idx[t + 2]];
		const area2 =
			(pos[b * 3] - pos[a * 3]) * (pos[c * 3 + 1] - pos[a * 3 + 1]) -
			(pos[c * 3] - pos[a * 3]) * (pos[b * 3 + 1] - pos[a * 3 + 1]);
		assert.ok(area2 > 0, `triangle ${t / 3} must be CCW from +z (got ${area2})`);
	}
});

test("underworld plane spans every level on x and reaches deep on y", () => {
	const plane = new NetzachUnderworldPlane();
	const mesh = plane.reveal();
	const pos = mesh.geometry.attributes.position.array;
	const xs = [pos[0], pos[3], pos[6], pos[9]];
	const ys = [pos[1], pos[4], pos[7], pos[10]];
	// Widest canonical level is 53; the quad must dwarf it.
	assert.ok(Math.min(...xs) <= -100, "plane extends far left of any level");
	assert.ok(Math.max(...xs) >= 200, "plane extends far right of any level");
	assert.ok(Math.min(...ys) <= -100, "plane reaches deep below y=0");
	assert.ok(Math.max(...ys) >= 0, "plane top edge tucks at/below the terrain");
});

test("underworld plane carries normals and uvs for every vertex", () => {
	const plane = new NetzachUnderworldPlane();
	const mesh = plane.reveal();
	const count = mesh.geometry.attributes.position.count;
	assert.equal(mesh.geometry.attributes.normal.count, count, "normal per vertex");
	assert.equal(mesh.geometry.attributes.uv.count, count, "uv per vertex");
});

test("underworld plane can never be culled away", () => {
	const plane = new NetzachUnderworldPlane();
	const mesh = plane.reveal();
	assert.equal(mesh.frustumCulled, false, "frustum culling disabled");
	assert.equal(mesh.doubleSided, true, "backface culling disabled");
});

test("revealMesh returns the persistent mesh; reveal() is idempotent", () => {
	const plane = new NetzachUnderworldPlane();
	const mesh = plane.reveal();
	assert.equal(plane.revealMesh(), mesh);
	assert.equal(plane.reveal(), mesh, "second reveal returns the same mesh");
});
