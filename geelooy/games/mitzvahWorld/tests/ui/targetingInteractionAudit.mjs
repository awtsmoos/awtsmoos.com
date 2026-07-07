// B"H
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { cycleTarget, registerTargets, selectTarget, targetSnapshot } from "../../ckidsAwtsmoos/Olam/worlds/mitzvahWorld/runtime/TargetingState.js";

registerTargets([
  { id:"npc1", name:"Friendly Rebbe", type:"friendly-npc", health:100, distance:2 },
  { id:"goat1", name:"Goat", type:"animal", health:25, distance:4 },
  { id:"monster1", name:"Kelipa", type:"monster", health:60, distance:8 },
  { id:"door1", name:"Cottage Door", type:"door", distance:3 },
  { id:"book1", name:"Chumash", type:"interactable", distance:1 }
]);
let snap = targetSnapshot();
for (const type of ["friendly-npc", "animal", "monster", "door", "interactable"]) assert(snap.selectableTypes.includes(type), `missing ${type}`);
selectTarget("door1");
assert.equal(targetSnapshot().selected.type, "door");
cycleTarget(1);
assert.equal(targetSnapshot().selected.type, "interactable");
const hud = readFileSync("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/ui/PlayerFacingHudGuarantee.js", "utf8");
assert(hud.includes("__AWTSMOOS_TARGETING_STATE__"), "HUD must read targeting state");
assert(hud.includes("tap/click/select"), "HUD must explain old select/tap/click targeting");
console.log(JSON.stringify({ ok:true, test:"targetingInteractionAudit", selected:targetSnapshot().selected, types:snap.selectableTypes }, null, 2));
