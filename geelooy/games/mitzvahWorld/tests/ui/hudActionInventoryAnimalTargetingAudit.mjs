// B"H
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const hud = readFileSync("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/ui/PlayerFacingHudGuarantee.js", "utf8");
const targeting = readFileSync("ckidsAwtsmoos/Olam/worlds/mitzvahWorld/runtime/TargetingState.js", "utf8");
const index = readFileSync("index.js", "utf8");

for (const token of ["data-hud=\"action-bar\"", "icon-only-action-bar", "data-hud=\"inventory-button\"", "data-hud-link=\"inventory-bag\"", "data-hud=\"inventory-panel\"", "data-hud=\"target-button\"", "🎒", "🎯", "⚡", "📖", "KeyI", "KeyT", "KeyX", "KeyR", "__AWTSMOOS_PLAYER_FACING_HUD_GUARANTEE__"]) assert(hud.includes(token), `missing HUD token ${token}`);
assert(!hud.includes("Action</span>") && !hud.includes("Bag</span>") && !hud.includes("Target</span>"), "action bar regressed to text labels instead of icon-only buttons");
for (const token of ["cycleAnimalTarget", "__AWTSMOOS_CYCLE_ANIMAL_TARGET__", "event.code === \"KeyY\"", "tag === \"canvas\"", "awtsmoosTargetHighlighted", "targetHighlightVisible", "target-marker", "__AWTSMOOS_SELECTED_TARGET_INFO__", "health", "distance"]) assert(targeting.includes(token), `missing targeting token ${token}`);
for (const token of ["Friendly Rebbe", "Nearby Helper", "Village Cow", "Forest Deer", "Chai Forest Fox", "Village Goat", "Training Kelipa", "Main Cottage Door", "__AWTSMOOS_INVENTORY_STATE__", "__AWTSMOOS_ACTIVE_QUEST__"]) assert(index.includes(token), `missing boot gameplay token ${token}`);

console.log(JSON.stringify({ ok:true, test:"hudActionInventoryAnimalTargetingAudit", iconOnlyActionBar:true, inventoryBagLink:true, animalTargeting:true }, null, 2));
