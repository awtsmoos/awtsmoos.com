// B"H
/**
 * @file VillageCombatState.js
 * @description
 * Chapter 703: The reward ledger remembers every refined spark.
 *
 * The Awtsmoos makes battle meaningful only when the deed echoes into mission,
 * purse, and growth. This state object owns those echoes for the village camp.
 */

function n(value, fallback = 0) { return Number.isFinite(Number(value)) ? Number(value) : fallback; }

/**
 * Tracks village combat quest progress and rewards.
 */
export default class VillageCombatState {
  /** @param {object} olam World. @param {object} mission Mission manifest. */
  constructor(olam, mission) {
    this.olam = olam;
    this.mission = mission;
    this.kills = 0;
    this.perutas = 0;
    this.completed = false;
    this.accepted = false;
    this.startedAt = Date.now();
  }

  /** Announces the village mission to the HUD. */
  announce() {
    this.olam?.ayshPeula?.("ui event", "levelMission", this.mission);
    this.toast("Village combat unlocked: use V, left click, or ATK.", "info");
    this.syncHud("ready");
  }

  /** Accepts the quest once, revealing the tracker after an NPC conversation. */
  accept() {
    if (this.accepted) return this.toast("The meadow shlichus is already active.", "info");
    this.accepted = true;
    this.kills = 0;
    this.announce();
  }

  /** @param {object} mob Defeated mob. */
  recordKill(mob) {
    this.perutas += n(mob.perutas);
    this.rewardPlayer(mob);
    if (!this.accepted) return this.toast(`${mob.name} refined. Speak to Reb Mendel for the meadow shlichus.`, "success");
    this.kills += 1;
    this.olam?.chossid?.updateQuestProgress?.("kill", "wildAnimal");
    this.toast(`${mob.name} refined: +${mob.xpValue || 0} XP, +${mob.perutas || 0} perutas`, "success");
    this.syncHud("kill");
    if (!this.completed && this.kills >= n(this.mission.targetKills, 5)) this.complete();
  }

  /** @param {object} mob Defeated mob. */
  rewardPlayer(mob) {
    const player = this.olam?.player || this.olam?.chossid;
    const xp = n(mob.xpValue);
    if (xp > 0) {
      if (typeof player?.gainXp === "function") player.gainXp(xp);
      else if (typeof player?.gainXP === "function") player.gainXP(xp);
      else player && (player.xp = n(player.xp) + xp);
    }
    player && (player.personalPerutas = n(player.personalPerutas) + n(mob.perutas));
  }

  /** Completes the training mission and pays its bonus once. */
  complete() {
    this.completed = true;
    const reward = this.mission.completionReward || {};
    const player = this.olam?.player || this.olam?.chossid;
    const xp = n(reward.xp);
    const perutas = n(reward.perutas);
    if (xp > 0) {
      if (typeof player?.gainXp === "function") player.gainXp(xp);
      else if (typeof player?.gainXP === "function") player.gainXP(xp);
      else player && (player.xp = n(player.xp) + xp);
    }
    player && (player.personalPerutas = n(player.personalPerutas) + perutas);
    this.perutas += perutas;
    this.toast(`Mission complete: +${xp} XP, +${perutas} perutas. Lava levels are ready.`, "success");
    this.olam?.ayshPeula?.("ui event", "effectsOverlay", { text: "VILLAGE MISSION COMPLETE", color: "#9effd0" });
    this.syncHud("complete");
  }

  /** @param {string} stage Progress stage. */
  syncHud(stage) {
    const payload = {
      villageCombat: {
        stage,
        kills: this.kills,
        targetKills: n(this.mission.targetKills, 5),
        perutas: this.perutas,
        completed: this.completed
      },
      levelMission: {
        ...this.mission,
        missionText: `${this.mission.missionText} Progress: ${this.kills}/${this.mission.targetKills}.`
      }
    };
    this.olam?.ayshPeula?.("ui event", "gameHUD", payload);
  }

  /** @param {string} message Text. @param {string} type Toast type. */
  toast(message, type = "info") {
    this.olam?.ayshPeula?.("ui event", "toast", { message: `B"H - ${message}`, type });
  }
}
