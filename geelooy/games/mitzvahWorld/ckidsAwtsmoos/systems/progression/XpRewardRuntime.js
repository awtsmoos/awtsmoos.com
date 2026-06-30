// B"H
/**
 * @file XpRewardRuntime.js
 * @description
 * Lord of JSDoc, Chapter Nine: The Defeat Spark Enters One River.
 *
 * A creature falling in Mitzvah World is not merely subtraction of HP. It is a
 * chain of revealed consequences: XP, wallet reward, loot sparkle, HUD echo, and
 * a quiet debug witness. This module is that existing reward river. Combat,
 * village animals, Torah passages, and mission completion may approach from
 * different gates, but the reward itself passes through one canonical mouth.
 *
 * The Awtsmoos creates the whole world from nothing every instant; this file
 * refuses to let one instant pay XP, another pay perutas, and a third pretend no
 * reward happened. One target, one `__xpRewarded` seal, one living outcome.
 */
import { grantPlayerXp, ensurePlayerLevel } from "./PlayerLevelRuntime.js";
import { ensureCreatureLevel } from "./CreatureLevelRuntime.js";
import { makeLootableCorpse, lootSparklePayload } from "../loot/LootRuntime.js";
import { awardMoney } from "../economy/wallet/PersonalPerutaWallet.js";
import { logViralGameplay } from "../debug/ViralGameplayLog.js";

function playerOf(olam) { return olam?.player || olam?.chossid || null; }
function n(value, fallback = 0) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }
function playerLevel(olam) { return Number(playerOf(olam)?.level || 1); }
function rewardPerutas(target, context = {}) { return Math.max(0, Math.floor(n(context.perutas ?? target?.perutas ?? target?.perutaReward, 0))); }
function bindOlam(player, olam) { if (player && olam && !player.olam) player.olam = olam; return player; }

export function xpForCreature(olam, target, context = {}) {
  const creature = ensureCreatureLevel(target, playerLevel(olam)) || {};
  const delta = Math.max(-8, Math.min(8, n(creature.level, 1) - playerLevel(olam)));
  const gray = delta <= -5, multiplier = gray ? 0.1 : 1 + delta * 0.14;
  const torah = context.torahPassage ? 0.35 : 0;
  return Math.max(gray ? 1 : 8, Math.floor((creature.xpReward || 25) * (multiplier + torah)));
}

function maybeCreateLoot(olam, target, context) {
  if (!olam || !target || target.__lootCorpseCreated || context.skipLoot) return null;
  target.__lootCorpseCreated = true;
  const corpse = makeLootableCorpse(olam, target, { reason:"creature-defeat", ...context });
  olam?.ayshPeula?.("ui event", "lootSparkle", lootSparklePayload(olam));
  return corpse;
}

export function rewardCreatureDefeat(olam, target, context = {}) {
  if (!target || target.__xpRewarded) return null;
  target.__xpRewarded = true;
  const amount = Math.max(0, Math.floor(n(context.xp ?? xpForCreature(olam, target, context))));
  const category = context.torahPassage ? "torahXp" : "combatXp";
  const reason = context.reason || (context.torahPassage ? "Torah XP" : "Combat XP");
  const result = grantPlayerXp(olam, amount, category, reason) || {};
  const perutas = rewardPerutas(target, context);
  const player = bindOlam(playerOf(olam), olam);
  const wallet = perutas > 0 ? awardMoney(player, perutas, "creature defeat") : null;
  const corpse = maybeCreateLoot(olam, target, context);
  olam?.ayshPeula?.("ui event", "combatLog", { text:`${target.name || "Creature"} yielded ${amount} XP${perutas ? ` and ${perutas} perutas` : ""}`, category });
  logViralGameplay(olam, "reward", "creature-defeat", { target:target.id || target.name, xp:amount, perutas, category, source:context.source || "combat" });
  return { ...result, perutas, wallet, loot:corpse };
}

export function rewardMissionXp(olam, amount, title = "Shlichus") {
  ensurePlayerLevel(bindOlam(playerOf(olam), olam), olam);
  const result = grantPlayerXp(olam, amount, "shlichusXp", title);
  logViralGameplay(olam, "reward", "mission-xp", { title, xp:Math.max(0, Math.floor(n(amount))) });
  return result;
}

export function rewardExplorationXp(olam, amount, title = "Exploration") {
  const result = grantPlayerXp(olam, amount, "explorationXp", title);
  logViralGameplay(olam, "reward", "exploration-xp", { title, xp:Math.max(0, Math.floor(n(amount))) });
  return result;
}

export default { xpForCreature, rewardCreatureDefeat, rewardMissionXp, rewardExplorationXp };
