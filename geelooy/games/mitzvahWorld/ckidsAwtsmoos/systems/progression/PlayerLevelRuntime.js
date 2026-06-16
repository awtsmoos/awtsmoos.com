// B"H
/**
 * @file PlayerLevelRuntime.js
 * @description XP, levels, HP, koach, category streams, and rested XP bonus for one-player MitzvahWorld progression.
 */
import { consumeRestedBonus } from "./RestedXpRuntime.js";
const XP_KEYS = ["combatXp", "torahXp", "shlichusXp", "explorationXp"];
const DEFAULTS = Object.freeze({ level:1, xp:0, xpToNext:120 });
export const xpToNextLevel = level => Math.floor(90 + Math.max(1, level) ** 1.72 * 48);
export const hpForLevel = level => Math.floor(95 + Math.max(1, level) * 22);
export const koachForLevel = level => Math.floor(48 + Math.max(1, level) * 8);
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
function emit(olam, name, payload) { olam?.ayshPeula?.("ui event", name, payload); }
export function ensurePlayerLevel(player, olam = player?.olam) {
  if (!player) return null;
  player.level = Math.max(1, Number(player.level || DEFAULTS.level));
  player.xp = Math.max(0, Number(player.xp || DEFAULTS.xp));
  player.xpToNext = Math.max(1, Number(player.xpToNext || xpToNextLevel(player.level)));
  for (const key of XP_KEYS) player[key] = Math.max(0, Number(player[key] || 0));
  player.maxHp = hpForLevel(player.level);
  player.maxKoach = koachForLevel(player.level);
  player.baseStats ||= {};
  player.currentStats ||= {};
  player.baseStats.health = player.maxHp;
  player.currentStats.maxHealth = player.maxHp;
  player.currentStats.health = Math.min(player.maxHp, Math.max(1, Number(player.currentStats.health || player.hp || player.maxHp)));
  player.hp = player.currentStats.health;
  player.koach = Math.min(player.maxKoach, Math.max(0, Number(player.koach ?? player.maxKoach)));
  emitPlayerProgress(olam, player);
  return player;
}
export function emitPlayerProgress(olam, player = playerOf(olam)) {
  if (!player) return false;
  const payload = { level:player.level, xp:player.xp, xpToNext:player.xpToNext, hp:player.hp, maxHp:player.maxHp, koach:player.koach, maxKoach:player.maxKoach, combatXp:player.combatXp, torahXp:player.torahXp, shlichusXp:player.shlichusXp, explorationXp:player.explorationXp, restedXp:player.restedXp || null };
  emit(olam, "playerProgress", payload);
  emit(olam, "gameHUD", { updateStats:payload, xpBar:payload });
  return payload;
}
export function grantPlayerXp(olam, amount = 0, category = "combatXp", reason = "XP") {
  const player = ensurePlayerLevel(playerOf(olam), olam);
  if (!player) return null;
  const gain = Math.max(0, Math.floor(Number(amount) || 0));
  const restedBonus = category === "combatXp" || category === "torahXp" ? consumeRestedBonus(olam, gain) : 0;
  player.xp += gain + restedBonus;
  const key = XP_KEYS.includes(category) ? category : "combatXp";
  player[key] += gain;
  let leveled = 0;
  while (player.xp >= player.xpToNext) {
    player.xp -= player.xpToNext;
    player.level += 1;
    player.xpToNext = xpToNextLevel(player.level);
    leveled += 1;
  }
  ensurePlayerLevel(player, olam);
  emit(olam, "floatingCombatText", { text:`+${gain}${restedBonus ? ` +${restedBonus} rested` : ""} ${reason}`, kind:"xp" });
  if (leveled) emit(olam, "effectsOverlay", { text:`LEVEL UP ${player.level}!`, color:"#ffd700" });
  return { player, gain, restedBonus, leveled, category:key };
}
export default { ensurePlayerLevel, grantPlayerXp, emitPlayerProgress, xpToNextLevel, hpForLevel, koachForLevel };
