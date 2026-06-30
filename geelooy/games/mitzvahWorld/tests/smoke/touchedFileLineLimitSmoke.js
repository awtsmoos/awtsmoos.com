// B"H
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const files = [
  "ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/houses/door/DoorInteractionRuntime.js",
  "ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/houses/door/DoorPersistence.js",
  "ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/houses/door/DoorProxyRuntime.js",
  "ckidsAwtsmoos/systems/ground/GroundProbe2D.js",
  "ckidsAwtsmoos/systems/ground/GroundViolationDetector.js",
  "ckidsAwtsmoos/systems/ground/EntityGroundValidator.js",
  "ckidsAwtsmoos/systems/collision/probes/CollisionOwnerMetadata.js",
  "ckidsAwtsmoos/systems/collision/probes/InvisibleWallDetector.js",
  "ckidsAwtsmoos/systems/collision/probes/MissingWallDetector.js",
  "ckidsAwtsmoos/systems/debug/visualProof/VisualProofSvg.js",
  "ckidsAwtsmoos/systems/debug/visualProof/VisualProofManifest.js",
  "ckidsAwtsmoos/systems/debug/visualProof/VisualProofWriter.js",
  "tests/helpers/longRun/DenseWorldData.js",
  "tests/helpers/longRun/LongRunActionPlan.js",
  "tests/helpers/longRun/LongRunRecorder.js",
  "tests/helpers/longRun/LongRunReportWriter.js",
  "tests/helpers/longRun/LongRunScenario.js",
  "tests/helpers/visualProof/VisualProofPaths.js",
  "tests/smoke/playerNeverUndergroundSmoke.js",
  "tests/smoke/animalsAboveGroundSmoke.js",
  "tests/smoke/invisibleWallDetectionSmoke.js",
  "tests/smoke/missingWallDetectionSmoke.js",
  "tests/smoke/liveAnimalsGroundCollisionTargetSmoke.js",
  "tests/smoke/liveBridgeVisualProofManifestSmoke.js",
  "tests/smoke/liveLongRunGameplayActionsSmoke.js",
  "tests/smoke/liveQualityPreserved60fpsSmoke.js",
  "tests/smoke/worldQualityReportSmoke.js",
  "tests/smoke/liveBridge60fpsBudgetSmoke.js",
  "tests/smoke/touchedFileLineLimitSmoke.js"
];

for (const file of files) {
  const lines = Number(execFileSync("wc", ["-l", file], { encoding:"utf8" }).trim().split(/\s+/)[0]);
  assert(lines <= 100, `${file} has ${lines} lines`);
}
console.log("B'H touchedFileLineLimitSmoke passed", { files:files.length });
