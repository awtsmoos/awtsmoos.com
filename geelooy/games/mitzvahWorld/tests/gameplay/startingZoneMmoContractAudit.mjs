// B"H
/** Proves the first-generation MMO starter-zone contract as executable gameplay data. */
import { runStartingZoneMmoContract } from "../../ckidsAwtsmoos/systems/gameplay/StartingZoneMmoRuntime.js";

function assert(ok, message) {
  if (!ok) throw new Error(message);
}

let t = 1000;
const result = runStartingZoneMmoContract({ clock:{ now:() => t += 17 } });

assert(result.ok, "starting-zone MMO contract failed");
assert(result.npcs >= 24, "needs dozens of friendly NPCs");
assert(result.enemies >= 36, "needs many battle animals/enemies");
assert(result.houses >= 6, "roads must lead to real procedural houses");
assert(result.doors >= 6, "each starter house needs a clickable door");
assert(result.roads >= 6, "subzones need real road data");
assert(result.forestInstances >= 400, "starter zone needs dense instanced forest data");
assert(result.actionBar.every(a => a.icon), "every action bar ability needs an icon");
assert(result.actionBar.some(a => a.style === "melee"), "missing melee action");
assert(result.actionBar.some(a => a.style === "ranged"), "missing ranged action");
assert(result.facingFailure.reason === "must-face-target", "facing rule did not block attack");
assert(result.meleeHits.some(hit => hit.killed), "melee did not kill target");
assert(result.lootUi.open, "corpse click did not open loot UI");
assert(result.looted.ok, "loot-all failed");
assert(result.ranged.ok, "ranged attack failed");
assert(result.passive.beforeHit === "idle" && result.passive.hit, "idle-until-attacked enemy behavior failed");
assert(result.doorOpen.open, "clicking a house door did not open an indoor payload");
assert(result.enemyStates.some(e => ["attack", "charge", "chase"].includes(e.state)), "enemy AI did not enter combat states");
assert(result.respawn.afterRespawn, "enemy did not respawn");
assert(result.service.offer.buttons.accept, "quest offer missing accept");
assert(result.service.accepted.ok && result.service.turnedIn.ok, "quest flow failed");
assert(result.service.vendor.items.every(item => item.icon || item.id), "vendor items need icons or ids");
assert(result.service.trainer.trainers.length >= 4, "trainer choices missing");
assert(result.perf.targetFps === 60, "performance target must be 60fps");
assert(result.perf.sharedBrainLoops <= 8, "same-type NPCs must share update loops");
assert(result.perf.spatial.kind === "spatial-hash-near-octree-front", "missing short-range spatial partition");
assert(result.perf.activeWithinBudget, "active view bubble exceeds budget");
assert(result.perf.roadsSolid, "roads must have solid collider data");
assert(result.perf.doorsClickable, "doors must be clickable interactive data");
assert(result.perf.instancedProps, "village props must be instanced");
assert(result.perf.treeLayers >= 5, "forest layers too thin");
assert(result.perf.farAnimalsMostlyIdle, "far animals must sleep or impostor-update");

console.log(JSON.stringify({
  ok:true,
  npcs:result.npcs,
  enemies:result.enemies,
  houses:result.houses,
  doors:result.doors,
  roads:result.roads,
  actionSlots:result.actionBar.length,
  facingFailure:result.facingFailure.reason,
  lootOpened:result.lootUi.open,
  looted:result.looted.ok,
  doorOpen:result.doorOpen.open,
  respawn:result.respawn,
  vendorItems:result.service.vendor.items.length,
  trainers:result.service.trainer.trainers.length,
  perf:result.perf
}, null, 2));
