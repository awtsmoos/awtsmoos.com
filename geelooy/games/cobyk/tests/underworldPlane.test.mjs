//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file underworldPlane.test.mjs
 * @description Proves the Netzach underworld plane (the earth that fills the
 * dead band below the terrain) faces the camera and spans the level width.
 * Yaakov 2026-10-13 round 2: the original index order [0,1,2, 0,2,3] wound
 * clockwise seen from +z, so the plane was back-facing and frustum-culled —
 * the blue-gray dead band stayed on screen. This test locks the fix.
 *
 * Run: node --import ./tests/support/cobykLibsRegister.mjs --test tests/underworldPlane.test.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";
import { NetzachUnderworldPlane } from "../src/render/NetzachUnderworldPlane.js";

test("underworld plane triangles wind counter-clockwise from the camera side", () => {
	const plane = new NetzachUnderworldPlane();
	const mesh = plane.reveal(0, 100);
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

test("underworld plane spans beyond the level on x and reaches deep on y", () => {
	const plane = new NetzachUnderworldPlane();
	const mesh = plane.reveal(10, 90);
	const pos = mesh.geometry.attributes.position.array;
	const xs = [pos[0], pos[3], pos[6], pos[9]];
	const ys = [pos[1], pos[4], pos[7], pos[10]];
	assert.ok(Math.min(...xs) < 10, "plane extends left of the level");
	assert.ok(Math.max(...xs) > 90, "plane extends right of the level");
	assert.ok(Math.min(...ys) < -10, "plane reaches deep below y=0");
	assert.ok(Math.max(...ys) >= 0, "plane top edge tucks at/below the terrain");
});

test("revealMesh returns the built mesh and clear detaches it", () => {
	const plane = new NetzachUnderworldPlane();
	assert.equal(plane.revealMesh(), null);
	const mesh = plane.reveal(0, 50);
	assert.equal(plane.revealMesh(), mesh);
	plane.clear();
	assert.equal(plane.revealMesh(), null);
});
