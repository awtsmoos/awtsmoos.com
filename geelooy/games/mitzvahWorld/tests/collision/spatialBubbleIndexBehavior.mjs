// B"H
import assert from "node:assert/strict";
import SpatialBubbleIndex from "../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/collision/SpatialBubbleIndex.js";

const index = new SpatialBubbleIndex({ cellSize:10 });
index.register({ id:"player_wall", kind:"house", layer:0, x:2, z:0, radius:1 });
index.register({ id:"near_goat", kind:"animal", layer:1, x:9, z:0, radius:1 });
index.register({ id:"far_house", kind:"house", layer:3, x:80, z:0, radius:4 });
index.setPlayerPosition(0, 0);

const immediate = index.queryCircle(0, 0, 4, entry => entry.layer === 0);
assert.deepEqual(immediate.map(entry => entry.id), ["player_wall"], "layer-0 query returns only immediate colliders");

const near = index.queryCircle(0, 0, 14, entry => entry.layer <= 1);
assert.deepEqual(near.map(entry => entry.id), ["player_wall", "near_goat"], "near bubble excludes visual/dormant far entries");

const diag = index.diag();
assert.equal(diag.activeByLayer[0], 1);
assert.equal(diag.activeByLayer[1], 1);
assert.equal(diag.activeByLayer[3], 1);
assert(diag.averageCandidates > 0, "diagnostics record candidate counts");

console.log("B\"H spatialBubbleIndexBehavior passed.", diag);
