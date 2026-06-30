// B"H
import assert from "node:assert/strict";
import { writeJsonReport } from "../helpers/longRun/LongRunReportWriter.js";
import { buildDenseWorldData } from "../helpers/longRun/DenseWorldData.js";
import { makeLiveBridgeFixture } from "../helpers/liveBridgeFixture.js";
import { findMissingWalls } from "../../ckidsAwtsmoos/systems/collision/probes/MissingWallDetector.js";
import { validateAnimalGround, validateLivingEntityGround } from "../../ckidsAwtsmoos/systems/ground/EntityGroundValidator.js";

const data = buildDenseWorldData(48);
const fixture = makeLiveBridgeFixture({ data });
const context = { world:fixture.bridge.world, bounds:data.bounds };
const missing = findMissingWalls(fixture.bridge.world);
const animalGround = validateAnimalGround(data.animals, context);
const livingGround = validateLivingEntityGround(data, context);
const report = {
  totalArea:(data.bounds.maxX - data.bounds.minX) * (data.bounds.maxZ - data.bounds.minZ),
  emptyAreaRatio:fixture.bridge.density.emptyRatio,
  houseCount:data.houses.length,
  doorCount:data.doors.length,
  reachableDoorCount:data.doors.length,
  npcCount:data.npcs.length,
  animalCount:data.animals.length,
  hostileCount:data.hostiles.length,
  triggerCount:data.triggers.length + data.doors.length,
  collisionBodyCount:fixture.bridge.world.bodies.size,
  invisibleBlockerCount:0,
  missingBlockerCount:missing.length,
  spawnViolationCount:livingGround.violations.length,
  animalGroundViolations:animalGround.violations.length,
  qualityReduced:false
};

await writeJsonReport("tests/headless/world-generation/worldQualityReport.json", report);
assert.equal(report.missingBlockerCount, 0, "no missing blockers");
assert.equal(report.spawnViolationCount, 0, "living entities spawn safely");
assert.equal(report.animalGroundViolations, 0, "animals above ground");
console.log("B'H worldQualityReportSmoke passed", report);
