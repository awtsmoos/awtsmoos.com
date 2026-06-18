// B"H
/**
 * @file SpatialHash2D.smoke.mjs
 * @description Chapter 451: the grid is tested by little travelers. They cross
 * cells, disappear from old places, and prove that nearness can be answered
 * without asking every soul in the world.
 */
import assert from "node:assert/strict";
import { SpatialHash2D } from "../hash/SpatialHash2D.js";
import { SpatialHandle } from "../hash/SpatialHandle.js";
import { activityBandForDistanceSq, shouldTickBand } from "../activity/ActivityBands.js";
const hash = new SpatialHash2D({ cellSize: 10 });
const a = new SpatialHandle({ id: "a", radius: 1 });
hash.upsert(a, 0, 0, 1);
let ids = [];
assert.equal(hash.queryCircle(0, 0, 2, handle => ids.push(handle.id)), 1);
assert.deepEqual(ids, ["a"]);
hash.upsert(a, 25, 0, 1);
ids = [];
assert.equal(hash.queryCircle(0, 0, 2, handle => ids.push(handle.id)), 0);
ids = [];
assert.equal(hash.queryCircle(25, 0, 2, handle => ids.push(handle.id)), 1);
assert.deepEqual(ids, ["a"]);
const b = new SpatialHandle({ id: "b", radius: 8 });
hash.upsert(b, 9, 0, 8);
ids = [];
hash.queryCircle(10, 0, 1, handle => ids.push(handle.id));
assert.equal(new Set(ids).size, ids.length);
assert.ok(ids.includes("b"));
hash.remove(b);
ids = [];
hash.queryCircle(9, 0, 10, handle => ids.push(handle.id));
assert.ok(!ids.includes("b"));
assert.equal(activityBandForDistanceSq(4).name, "full");
assert.equal(activityBandForDistanceSq(10000).name, "sleep");
assert.equal(shouldTickBand(12, { cadence: 6 }), true);
console.log("B'H SpatialHash2D smoke passed", hash.snapshot());
