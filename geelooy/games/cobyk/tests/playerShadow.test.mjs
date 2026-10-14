//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file playerShadow.test.mjs
 * @description Proves the Netzach player shadow is a camera-facing ellipse in
 * the XY plane (front-facing toward +z), never culled, and tracks the ground.
 * Yaakov 2026-10-13 round 3: the old disc lay flat in the XZ plane with its
 * front face pointing DOWN — from CobyK's side camera it was edge-on and
 * back-facing, so no shadow could ever paint. This test locks the redesign.
 *
 * Run: node --import ./tests/support/cobykLibsRegister.mjs --test tests/playerShadow.test.mjs
 */
import test from "node:test";
import assert from "node:assert/strict";
import { NetzachPlayerShadow } from "../src/render/NetzachPlayerShadow.js";

test("shadow ellipse winds counter-clockwise seen from the camera (+z)", () => {
	const shadow = new NetzachPlayerShadow();
	const mesh = shadow.revealGroup().children[0];
	const pos = mesh.geometry.attributes.position.array;
	const idx = Array.from(mesh.geometry.index.array);
	assert.ok(idx.length >= 60, "ellipse fan has all segments");
	for (let t = 0; t < idx.length; t += 3) {
		const [a, b, c] = [idx[t], idx[t + 1], idx[t + 2]];
		const area2 =
			(pos[b * 3] - pos[a * 3]) * (pos[c * 3 + 1] - pos[a * 3 + 1]) -
			(pos[c * 3] - pos[a * 3]) * (pos[b * 3 + 1] - pos[a * 3 + 1]);
		assert.ok(area2 > 0, `triangle ${t / 3} must be CCW from +z (got ${area2})`);
	}
});

test("shadow ellipse lies in the camera-facing XY plane", () => {
	const shadow = new NetzachPlayerShadow();
	const mesh = shadow.revealGroup().children[0];
	const pos = mesh.geometry.attributes.position.array;
	for (let i = 0; i < pos.length; i += 3) {
		assert.equal(pos[i + 2], 0, `vertex ${i / 3} sits in the XY plane (z=0)`);
	}
	const normals = mesh.geometry.attributes.normal.array;
	for (let i = 0; i < normals.length; i += 3) {
		assert.deepEqual(
			[normals[i], normals[i + 1], normals[i + 2]],
			[0, 0, 1],
			`vertex ${i / 3} normal faces the camera`
		);
	}
});

test("shadow can never be culled away", () => {
	const shadow = new NetzachPlayerShadow();
	const mesh = shadow.revealGroup().children[0];
	assert.equal(mesh.frustumCulled, false, "frustum culling disabled");
	assert.equal(mesh.doubleSided, true, "backface culling disabled");
});

test("shadow tick follows the player x and hugs the tracked ground", () => {
	const shadow = new NetzachPlayerShadow();
	// Settle: two stable frames so the ground tracker learns the feet level.
	shadow.tick(5, 1.5, 0.475);
	shadow.tick(5, 1.5, 0.475);
	const group = shadow.revealGroup();
	assert.equal(group.position.x, 5, "shadow follows player x");
	assert.ok(
		Math.abs(group.position.y - (1.5 - 0.475 + 0.06)) < 1e-9,
		"shadow sits at tracked ground + lift"
	);
	assert.ok(group.position.z > 0.5, "shadow rides in front of the terrain");
	// Jump: shadow stays at the ground, shrinks and fades.
	shadow.tick(6, 3.0, 0.475);
	assert.equal(group.position.x, 6, "shadow follows player x mid-jump");
	assert.ok(
		Math.abs(group.position.y - (1.5 - 0.475 + 0.06)) < 1e-9,
		"shadow stays glued to the ground mid-jump"
	);
});
