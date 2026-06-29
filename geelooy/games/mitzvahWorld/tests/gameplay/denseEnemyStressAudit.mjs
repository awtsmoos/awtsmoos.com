// B"H
import assert from "node:assert/strict";
import { createStartingZoneMmoRuntime } from "../../ckidsAwtsmoos/systems/gameplay/StartingZoneMmoRuntime.js";

let t = 2000;
const runtime = createStartingZoneMmoRuntime({ clock:{ now:() => t += 17 } });
const result = runtime.runDenseEnemyStress({ count:240, spread:24 });

assert.equal(result.spawned, 240, "stress pack should spawn hundreds of enemies");
assert.equal(result.nearby >= 200, true, "hundreds of enemies should be inside the nearby bubble");
assert.equal(result.sharedBrainLoops <= 5, true, "same-type enemies should use shared species loops");
assert.equal(result.withinBudget, true, "active AI must remain inside frame budget");
assert.equal(result.ai.active <= result.perf.activeEnemies, true, "AI active count cannot exceed performance plan");
assert.equal(result.perf.activeEnemies <= 18, true, "performance active enemies must clamp to budget");
assert.equal(result.throttled > 100, true, "excess nearby enemies must be throttled instead of full AI");
assert.equal(result.perf.targetFps, 60, "dense stress still targets 60fps policy");

console.log(JSON.stringify({ ok:true, test:"denseEnemyStressAudit", spawned:result.spawned, nearby:result.nearby, active:result.ai.active, throttled:result.throttled, sharedBrainLoops:result.sharedBrainLoops }, null, 2));
