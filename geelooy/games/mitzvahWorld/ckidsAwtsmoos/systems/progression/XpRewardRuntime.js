// B"H
/**
 * @file XpRewardRuntime.js
 * @description
 * Chapter 622: When a creature falls or calms, sparks do not vanish. They turn
 * into XP streams: combat, Torah, shlichus, exploration. The Awtsmoos counts
 * without becoming countable, and the HUD receives the report.
 */
import { grantPlayerXp, ensurePlayerLevel } from "./PlayerLevelRuntime.js";
import { ensureCreatureLevel } from "./CreatureLevelRuntime.js";
function playerLevel(olam) { return Number((olam?.player || olam?.chossid)?.level || 1); }
export function xpForCreature(olam, target, context = {}) {
  const creature = ensureCreatureLevel(target, playerLevel(olam)) || {};
  const delta = Math.max(-8, Math.min(8, Number(creature.level || 1) - playerLevel(olam)));
  const gray = delta <= -5;
  const multiplier = gray ? 0.1 : 1 + delta * 0.14;
  const torah = context.torahPassage ? 0.35 : 0;
  return Math.max(gray ? 1 : 8, Math.floor((creature.xpReward || 25) * (multiplier + torah)));
}
export function rewardCreatureDefeat(olam, target, context = {}) {
  if (!target || target.__xpRewarded) return null;
  target.__xpRewarded = true;
  const amount = xpForCreature(olam, target, context);
  const category = context.torahPassage ? "torahXp" : "combatXp";
  const reason = context.torahPassage ? "Torah XP" : "Combat XP";
  const result = grantPlayerXp(olam, amount, category, reason);
  olam?.ayshPeula?.("ui event", "combatLog", { text: `${target.name || "Creature"} yielded ${amount} XP`, category });
  return result;
}
export function rewardMissionXp(olam, amount, title = "Shlichus") {
  ensurePlayerLevel(olam?.player || olam?.chossid, olam);
  return grantPlayerXp(olam, amount, "shlichusXp", title);
}
export function rewardExplorationXp(olam, amount, title = "Exploration") {
  return grantPlayerXp(olam, amount, "explorationXp", title);
}
export default { xpForCreature, rewardCreatureDefeat, rewardMissionXp, rewardExplorationXp };
