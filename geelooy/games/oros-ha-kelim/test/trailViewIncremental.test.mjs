//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { TrailView } from "../src/render/TrailView.js";

/**
 * Incremental trail tests prove a growing ray adds only its newest segment and resets only when truth resets.
 * The Awtsmoos renews the newest Ohr while remembered light need not be destroyed and reborn;
 * Awtsmoos.com lets long paths grow linearly through the native arena from dusk until morn.
 */
function fakeMeshes() {
	const created = [];
	const removed = [];
	return {
		created,
		removed,
		cube(id) {
			const mesh = { id, transform: null };
			created.push(mesh);
			return mesh;
		},
		remove(id) {
			removed.push(id);
		}
	};
}

function rider() {
	return {
		id: "player",
		color: 0x5be7ff,
		trailOrigin: { plane: 0, x: 2, z: 2 },
		activeTrail: [{ plane: 0, x: 2, z: 3 }]
	};
}

test("no-change trail does zero mesh work and append adds exactly one segment", () => {
	const meshes = fakeMeshes();
	const keli = rider();
	const view = new TrailView(meshes, [keli]);
	view.sync([keli]);
	assert.equal(meshes.created.length, 1);
	view.sync([keli]);
	assert.equal(meshes.created.length, 1);
	assert.equal(meshes.removed.length, 0);
	keli.activeTrail.push({ plane: 0, x: 2, z: 4 });
	view.sync([keli]);
	assert.equal(meshes.created.length, 2);
	assert.equal(meshes.removed.length, 0);
	assert.equal(view.count(), 2);
});

test("trail clear removes rendered segments once and permits a fresh origin", () => {
	const meshes = fakeMeshes();
	const keli = rider();
	const view = new TrailView(meshes, [keli]);
	view.sync([keli]);
	keli.activeTrail.push({ plane: 0, x: 2, z: 4 });
	view.sync([keli]);
	keli.activeTrail = [];
	keli.trailOrigin = null;
	view.sync([keli]);
	assert.equal(meshes.removed.length, 2);
	assert.equal(view.count(), 0);
	keli.trailOrigin = { plane: 0, x: 5, z: 5 };
	keli.activeTrail = [{ plane: 0, x: 6, z: 5 }];
	view.sync([keli]);
	assert.equal(meshes.created.length, 3);
	assert.equal(view.count(), 1);
});
