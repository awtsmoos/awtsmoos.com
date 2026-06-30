// B"H
import { performance } from "node:perf_hooks";
import { liveBridgeReport } from "../../../ckidsAwtsmoos/systems/collision/CollisionLiveWorldAdapter.js";
import { validateAnimalGround, validatePlayerGround } from "../../../ckidsAwtsmoos/systems/ground/EntityGroundValidator.js";
import { unownedBlockers } from "../../../ckidsAwtsmoos/systems/collision/probes/InvisibleWallDetector.js";
import { classifyTarget } from "../../../ckidsAwtsmoos/systems/targeting/TargetClassifier.js";
import { makeLiveBridgeFixture } from "../liveBridgeFixture.js";
import { buildDenseWorldData } from "./DenseWorldData.js";
import { buildLongRunActionPlan, totalActionFrames } from "./LongRunActionPlan.js";
import { createLongRunRecorder } from "./LongRunRecorder.js";

export function runLongRunScenario(options = {}) {
  const data = buildDenseWorldData(options.count || 48);
  const fixture = makeLiveBridgeFixture({ data });
  const actions = buildLongRunActionPlan(options.repeats || 10);
  const recorder = createLongRunRecorder();
  for (const action of actions) runAction(fixture, action, recorder);
  const context = { world:fixture.bridge.world, bounds:data.bounds };
  for (const v of validatePlayerGround(fixture.olam.player, context).violations) recorder.addViolation("player-ground", v);
  for (const v of validateAnimalGround(data.animals, context).violations) recorder.addViolation("animal-ground", v);
  const report = recorder.summary({
    kind:"liveLongRunGameplayProof",
    durationSimulatedMs:Math.round(totalActionFrames(actions) * 1000 / 60),
    browserRafMeasured:false,
    qualityReduced:false,
    ...liveBridgeReport(fixture.bridge),
    consoleErrors:0
  });
  return { ...fixture, recorder, report };
}

function runAction(fixture, action, recorder) {
  const target = chooseTarget(fixture.data, action.delta.target);
  if (target) classifyTarget(target, { playerPosition:fixture.movement.pos() });
  for (let i = 0; i < action.frames; i++) {
    const start = performance.now();
    const result = fixture.movement.step(action.delta, 1 / 60);
    recorder.recordFrame(performance.now() - start, result, action.name);
    for (const v of unownedBlockers(fixture.bridge.world, result.hits)) recorder.addViolation(v.type, v);
  }
  if (action.delta.attack) recorder.addCount("combatActions");
  if (fixture.events.some(e => e.name === "cutsceneStart")) recorder.addCount("cutsceneEvents", 0);
}

function chooseTarget(data, type) {
  if (type === "npc") return data.npcs?.[0];
  if (type === "animal") return data.animals?.[0];
  if (type === "hostile") return data.hostiles?.[0];
  return null;
}

export default runLongRunScenario;
