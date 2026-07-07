// B"H
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const scene = JSON.parse(readFileSync("data/universe/examples/chossidBusyActionGameplayScene.json", "utf8"));
assert(scene.realism, "realism block missing");
assert(scene.realism.npcSchedules.length >= 2, "NPC schedules missing");
assert(scene.realism.ambientZones.length >= 2, "ambient zones missing");
for (const surface of ["grass","dirt","wood","stone"]) assert(scene.realism.surfaceFootsteps[surface], `missing footstep surface ${surface}`);
for (const key of ["doorMemory","foliageWind","dayNightLighting","interiorLighting","wildlifeReactions","dialogueFacing","reducedInputLatency"]) assert.equal(scene.realism[key], true, `missing realism flag ${key}`);
assert(scene.performanceBudgets.noFullSceneTraversalEveryFrame, "must forbid full scene traversal every frame");
assert(scene.performanceBudgets.spatialBuckets, "must require spatial buckets");
console.log(JSON.stringify({ ok:true, test:"realismSystemsSceneAudit", schedules:scene.realism.npcSchedules.length, ambientZones:scene.realism.ambientZones.length, budgets:scene.performanceBudgets }, null, 2));
