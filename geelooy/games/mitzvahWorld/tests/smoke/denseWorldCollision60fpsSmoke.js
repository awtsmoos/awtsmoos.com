// B"H
import assert from "node:assert/strict";
import { performance } from "node:perf_hooks";
import CollisionWorld2D from "../../ckidsAwtsmoos/systems/collision/CollisionWorld2D.js";
import CollisionTriggerRuntime from "../../ckidsAwtsmoos/systems/collision/CollisionTriggerRuntime.js";
import { nearestTarget } from "../../ckidsAwtsmoos/systems/targeting/TargetClassifier.js";

const bodies = [], entities = [];
for (let x = 0; x < 20; x++) for (let z = 0; z < 10; z++) {
  bodies.push({ id:`house_${x}_${z}`, kind:"house", x:x * 8 + 4, z:z * 8 + 4, width:4, depth:4, solid:true });
  bodies.push({ id:`door_${x}_${z}`, kind:"door", x:x * 8 + 4, z:z * 8 + 6.4, width:1, depth:.35, solid:true, open:(x + z) % 3 === 0 });
  if ((x + z) % 4 === 0) bodies.push({ id:`trigger_${x}_${z}`, kind:"quest-zone", x:x * 8, z:z * 8, width:3, depth:3, trigger:true });
  entities.push({ id:`npc_${x}_${z}`, userData:{ kind:"npc", friendly:true }, position:{ x:x * 8 + 1, z:z * 8 + 1 } });
  entities.push({ id:`animal_${x}_${z}`, userData:{ kind:"animal", peaceful:true, species:"goat" }, position:{ x:x * 8 + 6, z:z * 8 + 1 } });
  entities.push({ id:`fox_${x}_${z}`, userData:{ kind:"creature", hostile:true, attackable:true, species:"fox" }, position:{ x:x * 8 + 6, z:z * 8 + 6 } });
}

const world = new CollisionWorld2D({ cellSize:6, bodies });
const triggers = new CollisionTriggerRuntime(world);
let pos = { x:-2, z:2 }, triggerEvents = 0, targetHits = 0, candidateMax = 0;
const frameTimes = [];

for (let frame = 0; frame < 180; frame++) {
  const start = performance.now();
  const moved = world.moveCircle(pos, { x:1.35, z:Math.sin(frame / 9) * .45 }, 0.5);
  pos = moved.position;
  candidateMax = Math.max(candidateMax, moved.metrics.maxCandidates);
  triggerEvents += triggers.update("player", pos, 0.5).length;
  const nearby = entities.filter(e => Math.hypot(e.position.x - pos.x, e.position.z - pos.z) <= 14);
  if (nearestTarget(nearby, { playerPosition:pos })) targetHits++;
  frameTimes.push(performance.now() - start);
}

const avg = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length;
const worst = Math.max(...frameTimes);
assert(avg < 4, `average dense frame stays safely below budget: ${avg.toFixed(3)}ms`);
assert(worst < 16.67, `worst dense frame stays below 60fps budget: ${worst.toFixed(3)}ms`);
assert(candidateMax <= 18, `collision broadphase candidates are bounded: ${candidateMax}`);
assert(triggerEvents < 80, "trigger enter/exit events remain bounded, not per-frame spam");
assert(targetHits > 120, "targeting remains available through dense movement");

console.log("B'H denseWorldCollision60fpsSmoke passed", { avg, worst, candidateMax, triggerEvents, targetHits });
