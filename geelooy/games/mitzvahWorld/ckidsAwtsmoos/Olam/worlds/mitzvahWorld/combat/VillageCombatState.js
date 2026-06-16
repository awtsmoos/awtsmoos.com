// B"H
/**
 * @file VillageCombatState.js
 * @description Reward ledger for refined sparks, parser-clear and HUD-explicit.
 */
function n(value, fallback = 0) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }
function playerOf(olam) { return olam && (olam.player || olam.chossid) ? (olam.player || olam.chossid) : null; }
function callWorld(olam, channel, target, payload) { if (olam && typeof olam.ayshPeula === "function") olam.ayshPeula(channel, target, payload); }
function gainXp(player, xp) { if (!player || xp <= 0) return; if (typeof player.gainXp === "function") player.gainXp(xp); else if (typeof player.gainXP === "function") player.gainXP(xp); else player.xp = n(player.xp) + xp; }
function gainPerutas(player, amount) { if (player) player.personalPerutas = n(player.personalPerutas) + n(amount); }
function questKill(olam) { const chossid = olam && olam.chossid ? olam.chossid : null; if (chossid && typeof chossid.updateQuestProgress === "function") chossid.updateQuestProgress("kill", "wildAnimal"); }
export default class VillageCombatState {
  constructor(olam, mission) { this.olam = olam; this.mission = mission || {}; this.kills = 0; this.perutas = 0; this.completed = false; this.accepted = false; this.startedAt = Date.now(); }
  announce() { callWorld(this.olam, "ui event", "levelMission", this.mission); this.toast("Village combat unlocked: use V, left click, or ATK.", "info"); this.syncHud("ready"); }
  accept() { if (this.accepted) return this.toast("The meadow shlichus is already active.", "info"); this.accepted = true; this.kills = 0; this.announce(); }
  recordKill(mob) { this.perutas += n(mob.perutas); this.rewardPlayer(mob); if (!this.accepted) return this.toast(`${mob.name} refined. Speak to Reb Mendel for the meadow shlichus.`, "success"); this.kills += 1; questKill(this.olam); this.toast(`${mob.name} refined: +${mob.xpValue || 0} XP, +${mob.perutas || 0} perutas`, "success"); this.syncHud("kill"); if (!this.completed && this.kills >= n(this.mission.targetKills, 5)) this.complete(); }
  rewardPlayer(mob) { const player = playerOf(this.olam); gainXp(player, n(mob.xpValue)); gainPerutas(player, mob.perutas); }
  complete() { this.completed = true; const reward = this.mission.completionReward || {}, player = playerOf(this.olam); const xp = n(reward.xp), perutas = n(reward.perutas); gainXp(player, xp); gainPerutas(player, perutas); this.perutas += perutas; this.toast(`Mission complete: +${xp} XP, +${perutas} perutas. Lava levels are ready.`, "success"); callWorld(this.olam, "ui event", "effectsOverlay", { text:"VILLAGE MISSION COMPLETE", color:"#9effd0" }); this.syncHud("complete"); }
  syncHud(stage) { const targetKills = n(this.mission.targetKills, 5); const payload = { villageCombat:{ stage, kills:this.kills, targetKills, perutas:this.perutas, completed:this.completed }, levelMission:{ ...this.mission, missionText:`${this.mission.missionText || "Mission"} Progress: ${this.kills}/${targetKills}.` } }; callWorld(this.olam, "ui event", "gameHUD", payload); }
  toast(message, type = "info") { callWorld(this.olam, "ui event", "toast", { message:`B"H - ${message}`, type }); }
}
