// B"H
import assert from "node:assert/strict";
import { HeightFieldGenerator, CliffBandGenerator, ForestScatterPlanner, JourneyFogController, regionAt, speciesNames } from "../../geelooy/libs/awtsmoosCinematicWorld/index.js";
const terrain = new HeightFieldGenerator({ seed: 42 });
const grid = terrain.grid({ segments: 8, regionIndex: 2 });
assert.equal(grid.points.length, 81);
assert(grid.points.some(p => p.y > 2), "terrain must have ascent");
const cliffs = new CliffBandGenerator({ seed: 2 }).makeBands({ count: 4 });
assert.equal(cliffs.length, 4);
assert(cliffs.every(c => c.height > 2));
const forest = new ForestScatterPlanner({ seed: 5 }).plan({ count: 70 });
assert(forest.length > 25, "forest should be dense enough");
assert(new Set(forest.map(t => t.species)).size >= 2, "forest should vary species");
const fog = new JourneyFogController().stateAt(.33);
assert(fog.far < 38, "narrow forest fog should tighten visibility");
assert.equal(regionAt(.8).id, "summit");
assert(speciesNames().includes("cedar"));
console.log(JSON.stringify({ ok:true, test:"awtsmoosCinematicWorldCoreAudit", trees:forest.length, cliffs:cliffs.length, regions:[regionAt(.1).id, regionAt(.4).id, regionAt(.8).id] }, null, 2));
