// B"H
/** @file XpRewardRuntime.js @description Creature defeat now yields XP and a lootable corpse sparkle, so combat resolves into visible starter-zone reward. */
import { grantPlayerXp, ensurePlayerLevel } from "./PlayerLevelRuntime.js";
import { ensureCreatureLevel } from "./CreatureLevelRuntime.js";
import { makeLootableCorpse, lootSparklePayload } from "../loot/LootRuntime.js";
function playerLevel(olam) { return Number((olam?.player || olam?.chossid)?.level || 1); }
export function xpForCreature(olam, target, context = {}) {
  const creature = ensureCreatureLevel(target, playerLevel(olam)) || {};
  const delta = Math.max(-8, Math.min(8, Number(creature.level || 1) - playerLevel(olam)));
  const gray = delta <= -5, multiplier = gray ? 0.1 : 1 + delta * 0.14, torah = context.torahPassage ? 0.35 : 0;
  return Math.max(gray ? 1 : 8, Math.floor((creature.xpReward || 25) * (multiplier + torah)));
}
function maybeCreateLoot(olam, target, context) {
  if (!olam || !target || target.__lootCorpseCreated) return null;
  target.__lootCorpseCreated = true;
  const corpse = makeLootableCorpse(olam, target, { reason:"creature-defeat", ...context });
  olam?.ayshPeula?.("ui event", "lootSparkle", lootSparklePayload(olam));
  return corpse;
}
export function rewardCreatureDefeat(olam, target, context = {}) {
  if (!target || target.__xpRewarded) return null;
  target.__xpRewarded = true;
  const amount = xpForCreature(olam, target, context), category = context.torahPassage ? "torahXp" : "combatXp", reason = context.torahPassage ? "Torah XP" : "Combat XP";
  const result = grantPlayerXp(olam, amount, category, reason) || {}, corpse = maybeCreateLoot(olam, target, context);
  olam?.ayshPeula?.("ui event", "combatLog", { text:`${target.name || "Creature"} yielded ${amount} XP`, category });
  return { ...result, loot:corpse };
}
export function rewardMissionXp(olam, amount, title = "Shlichus") {
  ensurePlayerLevel(olam?.player || olam?.chossid, olam);
  return grantPlayerXp(olam, amount, "shlichusXp", title);
}
export function rewardExplorationXp(olam, amount, title = "Exploration") {
  return grantPlayerXp(olam, amount, "explorationXp", title);
}
export default { xpForCreature, rewardCreatureDefeat, rewardMissionXp, rewardExplorationXp };
