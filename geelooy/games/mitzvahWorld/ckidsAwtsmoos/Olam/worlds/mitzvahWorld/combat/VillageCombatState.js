// B"H
/**
 * @file VillageCombatState.js
 * @description
 * Lord of JSDoc, Chapter Ten: The Meadow Kill Ledger Bows to the Reward River.
 *
 * This village state does not own a second XP system and does not own a second
 * wallet. It owns mission counting, meadow proof, and the chossid-facing HUD
 * story. When an animal is refined, the actual reward flows through the existing
 * progression and PersonalPerutaWallet bridges, then returns here as mission
 * progress.
 *
 * The Awtsmoos speaks a deer, a fox, a wallet, an XP bar, and a quest objective
 * into existence in one breath. This file keeps those mirrors aligned instead
 * of letting old local helpers become rival worlds.
 */
import { awardMoney } from "../../../../systems/economy/wallet/PersonalPerutaWallet.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { rewardCreatureDefeat, rewardMissionXp } from "../../../../systems/progression/XpRewardRuntime.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { logViralGameplay } from "../../../../systems/debug/ViralGameplayLog.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

function n(value, fallback = 0) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }
function playerOf(olam) { return olam?.player || olam?.chossid || null; }
function callWorld(olam, channel, target, payload) { olam?.ayshPeula?.(channel, target, payload); }
function scopeOf(olam) { return olam?.aysh?.window || globalThis; }
function bindOlam(player, olam) { if (player && olam && !player.olam) player.olam = olam; return player; }
function proofLedger(olam) { const scope = scopeOf(olam); return scope.__MITZVAH_ANIMAL_KILL_CONFIRMATION__ ||= { seal:"animal-kill-proof-20260623-bh1", totalKills:0, missionKills:0, foodDropped:0, kills:[] }; }
function questKill(olam) { const chossid = olam?.chossid || null; if (typeof chossid?.updateQuestProgress === "function") chossid.updateQuestProgress("kill", "wildAnimal"); }
function proofRow(mob) { return { id:mob?.id, name:mob?.name, species:mob?.species, xp:n(mob?.xpValue), perutas:n(mob?.perutas), at:Date.now() }; }

export default class VillageCombatState {
  constructor(olam, mission) { this.olam = olam; this.mission = mission || {}; this.kills = 0; this.totalKills = 0; this.perutas = 0; this.completed = false; this.accepted = false; this.startedAt = Date.now(); proofLedger(olam).missionTarget = n(this.mission.targetKills, 5); }
  announce() { callWorld(this.olam, "ui event", "levelMission", this.mission); this.toast("Village combat unlocked: use V, left click, or ATK.", "info"); this.syncHud("ready"); }
  accept() { if (this.accepted) return this.toast("The meadow shlichus is already active.", "info"); this.accepted = true; this.kills = 0; this.announce(); }
  recordKill(mob) { const ledger = proofLedger(this.olam), row = proofRow(mob); this.totalKills += 1; ledger.totalKills += 1; ledger.kills.push(row); ledger.kills = ledger.kills.slice(-30); this.perutas += row.perutas; this.rewardPlayer(mob, row); callWorld(this.olam, "ui event", "animalKillProof", { ...row, totalKills:ledger.totalKills }); if (!this.accepted) { this.toast(`${mob.name} refined: +${row.xp} XP, +${row.perutas} perutas. Speak to Reb Mendel for the meadow shlichus.`, "success"); this.syncHud("ambient-kill"); return; } this.kills += 1; ledger.missionKills = this.kills; questKill(this.olam); logViralGameplay(this.olam, "quest", "kill-progress", { quest:"village-combat", kills:this.kills, targetKills:n(this.mission.targetKills, 5), mob:row.id }); this.toast(`${mob.name} refined: +${row.xp} XP, +${row.perutas} perutas`, "success"); this.syncHud("kill"); if (!this.completed && this.kills >= n(this.mission.targetKills, 5)) this.complete(); }
  recordFoodDrop(mob) { const ledger = proofLedger(this.olam); ledger.foodDropped += 1; ledger.lastFoodDrop = { id:mob?.id, species:mob?.species, at:Date.now() }; logViralGameplay(this.olam, "loot", "food-drop", ledger.lastFoodDrop); }
  rewardPlayer(mob, row = proofRow(mob)) { return rewardCreatureDefeat(this.olam, mob, { source:"village-combat-state", skipLoot:true, xp:row.xp, perutas:row.perutas, reason:"Animal Refinement XP" }); }
  complete() { this.completed = true; const reward = this.mission.completionReward || {}, player = bindOlam(playerOf(this.olam), this.olam); const xp = n(reward.xp), perutas = n(reward.perutas); rewardMissionXp(this.olam, xp, "Village Shlichus"); if (perutas > 0) awardMoney(player, perutas, "mission complete"); this.perutas += perutas; logViralGameplay(this.olam, "reward", "mission-complete", { mission:this.mission.id || "village-combat", xp, perutas }); this.toast(`Mission complete: +${xp} XP, +${perutas} perutas. Lava levels are ready.`, "success"); callWorld(this.olam, "ui event", "effectsOverlay", { text:"VILLAGE MISSION COMPLETE", color:"#9effd0" }); this.syncHud("complete"); }
  syncHud(stage) { const targetKills = n(this.mission.targetKills, 5), ledger = proofLedger(this.olam), player = playerOf(this.olam); const payload = { villageCombat:{ stage, kills:this.kills, totalKills:this.totalKills, targetKills, perutas:this.perutas, completed:this.completed }, animalKillProof:ledger, personalPerutas:{ personalPerutas:n(player?.personalPerutas), reason:"combat sync" }, levelMission:{ ...this.mission, missionText:`${this.mission.missionText || "Mission"} Progress: ${this.kills}/${targetKills}.` } }; callWorld(this.olam, "ui event", "gameHUD", payload); }
  toast(message, type = "info") { callWorld(this.olam, "ui event", "toast", { message:`B"H - ${message}`, type }); }
}
