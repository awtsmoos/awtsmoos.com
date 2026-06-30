// B"H
/**
 * @file VillageCombatState.js
 * @description Reward ledger and global proof channel for refined animal sparks.
 * XP, perutas, HUD, storage, and mission progress flow through one existing river.
 */
const BAG_KEY = "awtsmoosMitzvahPersonalPerutas";
function n(value, fallback = 0) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }
function playerOf(olam) { return olam && (olam.player || olam.chossid) ? (olam.player || olam.chossid) : null; }
function callWorld(olam, channel, target, payload) { if (olam && typeof olam.ayshPeula === "function") olam.ayshPeula(channel, target, payload); }
function scopeOf(olam) { return olam?.aysh?.window || globalThis; }
function readBag(scope) { try { return n(scope?.localStorage?.getItem(BAG_KEY), 0); } catch { return 0; } }
function writeBag(scope, value) { try { scope?.localStorage?.setItem(BAG_KEY, String(Math.max(0, Math.floor(n(value))))); } catch {} }
function proofLedger(olam) { const scope = scopeOf(olam); return scope.__MITZVAH_ANIMAL_KILL_CONFIRMATION__ ||= { seal:"animal-kill-proof-20260623-bh1", totalKills:0, missionKills:0, foodDropped:0, kills:[] }; }
function gainXp(player, xp) { if (!player || xp <= 0) return; if (typeof player.gainXp === "function") player.gainXp(xp); else if (typeof player.gainXP === "function") player.gainXP(xp); else player.xp = n(player.xp) + xp; }
function syncPlayerBag(player, value) { if (!player) return; player.personalPerutas = value; player.currency = value; if (player.inventory) { player.inventory.personalPerutas = value; player.inventory.perutas = value; } }
function publishBag(olam, value, delta, reason) { const payload = { personalPerutas:value, delta, reason }; callWorld(olam, "ui event", "gameHUD", { personalPerutas:payload }); callWorld(olam, "ui event", "personalPerutas", payload); }
function gainPerutas(olam, player, amount, reason = "combat reward") { const add = n(amount); if (!player || add <= 0) return 0; const scope = scopeOf(olam), current = Math.max(n(player.personalPerutas), n(player.currency), n(player.inventory?.personalPerutas), n(player.inventory?.perutas), readBag(scope)); const next = current + add; syncPlayerBag(player, next); writeBag(scope, next); publishBag(olam, next, add, reason); return add; }
function questKill(olam) { const chossid = olam && olam.chossid ? olam.chossid : null; if (chossid && typeof chossid.updateQuestProgress === "function") chossid.updateQuestProgress("kill", "wildAnimal"); }
function proofRow(mob) { return { id:mob?.id, name:mob?.name, species:mob?.species, xp:n(mob?.xpValue), perutas:n(mob?.perutas), at:Date.now() }; }
export default class VillageCombatState {
  constructor(olam, mission) { this.olam = olam; this.mission = mission || {}; this.kills = 0; this.totalKills = 0; this.perutas = 0; this.completed = false; this.accepted = false; this.startedAt = Date.now(); proofLedger(olam).missionTarget = n(this.mission.targetKills, 5); }
  announce() { callWorld(this.olam, "ui event", "levelMission", this.mission); this.toast("Village combat unlocked: use V, left click, or ATK.", "info"); this.syncHud("ready"); }
  accept() { if (this.accepted) return this.toast("The meadow shlichus is already active.", "info"); this.accepted = true; this.kills = 0; this.announce(); }
  recordKill(mob) { const ledger = proofLedger(this.olam), row = proofRow(mob); this.totalKills += 1; ledger.totalKills += 1; ledger.kills.push(row); ledger.kills = ledger.kills.slice(-30); this.perutas += row.perutas; this.rewardPlayer(mob); callWorld(this.olam, "ui event", "animalKillProof", { ...row, totalKills:ledger.totalKills }); if (!this.accepted) { this.toast(`${mob.name} refined: +${row.xp} XP, +${row.perutas} perutas. Speak to Reb Mendel for the meadow shlichus.`, "success"); this.syncHud("ambient-kill"); return; } this.kills += 1; ledger.missionKills = this.kills; questKill(this.olam); this.toast(`${mob.name} refined: +${row.xp} XP, +${row.perutas} perutas`, "success"); this.syncHud("kill"); if (!this.completed && this.kills >= n(this.mission.targetKills, 5)) this.complete(); }
  recordFoodDrop(mob) { const ledger = proofLedger(this.olam); ledger.foodDropped += 1; ledger.lastFoodDrop = { id:mob?.id, species:mob?.species, at:Date.now() }; }
  rewardPlayer(mob) { const player = playerOf(this.olam); gainXp(player, n(mob?.xpValue)); gainPerutas(this.olam, player, mob?.perutas, "animal combat"); }
  complete() { this.completed = true; const reward = this.mission.completionReward || {}, player = playerOf(this.olam); const xp = n(reward.xp), perutas = n(reward.perutas); gainXp(player, xp); gainPerutas(this.olam, player, perutas, "mission complete"); this.perutas += perutas; this.toast(`Mission complete: +${xp} XP, +${perutas} perutas. Lava levels are ready.`, "success"); callWorld(this.olam, "ui event", "effectsOverlay", { text:"VILLAGE MISSION COMPLETE", color:"#9effd0" }); this.syncHud("complete"); }
  syncHud(stage) { const targetKills = n(this.mission.targetKills, 5), ledger = proofLedger(this.olam), player = playerOf(this.olam); const payload = { villageCombat:{ stage, kills:this.kills, totalKills:this.totalKills, targetKills, perutas:this.perutas, completed:this.completed }, animalKillProof:ledger, personalPerutas:{ personalPerutas:n(player?.personalPerutas), reason:"combat sync" }, levelMission:{ ...this.mission, missionText:`${this.mission.missionText || "Mission"} Progress: ${this.kills}/${targetKills}.` } }; callWorld(this.olam, "ui event", "gameHUD", payload); }
  toast(message, type = "info") { callWorld(this.olam, "ui event", "toast", { message:`B"H - ${message}`, type }); }
}
