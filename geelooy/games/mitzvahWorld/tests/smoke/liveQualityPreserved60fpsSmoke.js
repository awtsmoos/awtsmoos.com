// B"H
import assert from "node:assert/strict";
import { runLongRunScenario } from "../helpers/longRun/LongRunScenario.js";

const { report } = runLongRunScenario({ repeats:10, count:48 });
assert.equal(report.qualityReduced, false, "quality flag is false");
assert.equal(report.houses, 48, "house count preserved");
assert.equal(report.doors, 48, "door count preserved");
assert.equal(report.npcs, 48, "NPC count preserved");
assert.equal(report.animals, 48, "animal count preserved");
assert.equal(report.hostiles, 48, "hostile count preserved");
assert(report.colliders >= 120, "collider richness preserved");
assert(report.averageFrameCostMs < 4, `average logic cost under 4ms: ${report.averageFrameCostMs}`);
assert(report.p95FrameCostMs < 16.67, `p95 logic cost under frame budget: ${report.p95FrameCostMs}`);
assert(report.broadphase.maxCandidates <= 8, `broadphase candidates bounded: ${report.broadphase.maxCandidates}`);
assert.equal(report.violations.length, 0, "no quality-run collision or ground violations");
console.log("B'H liveQualityPreserved60fpsSmoke passed", report);
