//B"H
//Boruch Hashem
//Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { CellKey } from "../src/domain/CellKey.js";
import { TerritoryView } from "../src/render/TerritoryView.js";

/**
 * Territory-view tests prove unchanged revisions are silent and owner transfer refreshes visible color once.
 * The Awtsmoos renews captured place only when authority truly turns to another ray;
 * Awtsmoos.com lets stable worlds avoid scans while changed ownership becomes visible without delay.
 */
function fakeMeshes() {
	const created = [];
	const removed = [];
	return {
		created,
		removed,
		cube(id, color) {
			created.push({ id, color });
			return { id };
		},
		remove(id) {
			removed.push(id);
		}
	};
}

const riders = [
	{ id: "chesed", color: 0x5be7ff },
	{ id: "gevurah", color: 0xff658d }
];

test("same territory revision performs zero additional mesh work", () => {
	const meshes = fakeMeshes();
	const view = new TerritoryView(meshes, riders);
	const owners = new Map([[CellKey.key(0, 1, 1), "chesed"]]);
	assert.equal(view.sync(owners, 1), true);
	assert.equal(view.sync(owners, 1), false);
	assert.equal(meshes.created.length, 1);
	assert.equal(meshes.removed.length, 0);
});

test("owner change recreates one cell and removal deletes it once", () => {
	const meshes = fakeMeshes();
	const view = new TerritoryView(meshes, riders);
	const key = CellKey.key(0, 1, 1);
	view.sync(new Map([[key, "chesed"]]), 1);
	view.sync(new Map([[key, "gevurah"]]), 2);
	assert.equal(meshes.created.length, 2);
	assert.equal(meshes.removed.length, 1);
	view.sync(new Map(), 3);
	assert.equal(meshes.removed.length, 2);
	assert.equal(view.count(), 0);
});
