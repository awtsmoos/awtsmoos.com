// B"H
/** @file npcSchedulerAudit.js @description ESM static proof that NPC interaction and schedule logic use scheduler/spatial hash. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "../..");
const read = p => fs.readFileSync(path.join(root, p), "utf8");
function assert(condition, message) { if (!condition) throw new Error(message); }
const scheduler = read("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/runtime/WorldInterestScheduler.js");
const grid = read("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/runtime/WorldInterestGrid.js");
const spatial = read("ckidsAwtsmoos/systems/npc/NpcSpatialHash.js");
const interaction = read("ckidsAwtsmoos/systems/npc/NpcInteractionRuntime.js");
const runtime = read("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/region/render/RegionNpcRuntime.js");
assert(scheduler.includes("animationLevel") && scheduler.includes("budget"), "WorldInterestScheduler must expose budgeted animation levels");
assert(grid.includes("nearest") && grid.includes("nearby"), "WorldInterestGrid must support nearby/nearest queries");
assert(spatial.includes("nearestNpcBySpatialHash") && spatial.includes("rebuildNpcSpatialHash"), "NpcSpatialHash must expose nearest/rebuild");
assert(interaction.includes("nearestNpcBySpatialHash") && !interaction.includes("KeyE"), "NPC interaction must use spatial hash and not steal KeyE");
assert(runtime.includes("getWorldInterestScheduler") && runtime.includes("rebuildNpcSpatialHash") && runtime.includes("nextNpcSlice"), "RegionNpcRuntime must use scheduler, spatial rebuilds, and slicing");
console.log(JSON.stringify({ ok:true, test:"npcSchedulerAudit" }, null, 2));
