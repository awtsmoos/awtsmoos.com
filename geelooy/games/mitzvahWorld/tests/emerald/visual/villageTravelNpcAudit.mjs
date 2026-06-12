#!/usr/bin/env node
/**
 * B"H
 * @file villageTravelNpcAudit.mjs
 * @description Chapter 559: verifies the village's complete human guide circle.
 */
import fs from "node:fs";

const village = JSON.parse(fs.readFileSync("levels/ladder/data/village.json", "utf8"));
const dialogue = fs.readFileSync("ckidsAwtsmoos/Olam/worker/handlers/ui/npcDialogueMarkup.js", "utf8");
const actions = fs.readFileSync("ckidsAwtsmoos/Olam/worker/handlers/ui/npcOverlayActions.js", "utf8");
const npcs = village.nivrayim.InteractiveNpc || [];
const chossidPath = "https://models-3122d.web.app/chossid.glb?k=1";

const details = {
  fiveHumanNpcs: npcs.length >= 5 && npcs.every((npc) => npc.useRealNpcModel && npc.path === chossidPath),
  questGiver: npcs.some((npc) => npc.missionId === "village_wild_sparks"),
  skillTeacher: npcs.some((npc) => npc.learnSkillId === "vhafta_es_hashem"),
  clothingMerchant: npcs.some((npc) => npc.hasShop && (npc.shopInventory?.length || 0) >= 3),
  lavaGuide: npcs.some((npc) => npc.travelPath === "ladder-1.json"),
  missionMarkup: dialogue.includes("data-npc-mission"),
  skillMarkup: dialogue.includes("data-npc-skill"),
  travelMarkup: dialogue.includes("data-npc-travel"),
  actionBindings:
    actions.includes("[data-npc-mission]") &&
    actions.includes("[data-npc-skill]") &&
    actions.includes("[data-npc-travel]"),
};

if (!Object.values(details).every(Boolean)) {
  console.error(JSON.stringify({ ok: false, details }, null, 2));
  process.exit(1);
}

console.log(JSON.stringify({ ok: true, details }, null, 2));
