// B"H
/** @file update.js @description Chossid frame loop explicitly advances GLB AnimationMixer after input chooses a clip. */
import Chai from "../../chai/index.js?compact=true&v=compact-engine-20260702-bh2";
function dtSeconds(deltaTime) { const n = Number(deltaTime); if (!Number.isFinite(n) || n <= 0) return 1 / 60; return n > 1 ? Math.min(.08, n / 1000) : Math.min(.08, n); }
function advanceGlbMixer(chossid, deltaTime) {
  if (!chossid?.animationMixer || !chossid.animations?.length) return;
  if (!chossid.currentAction && typeof chossid.playChaweeyoos === "function") chossid.playChaweeyoos(chossid.isWalking ? "run" : "stand", { duration:.035 });
  chossid.animationMixer.update(dtSeconds(deltaTime));
  const stats = chossid.__awtsmoosPlayerAnimationStats || { frames:0, advanced:0 };
  stats.frames += 1; stats.advanced += 1; stats.currentClip = chossid.currentAction?._clip?.name || null; stats.actionTime = Number(chossid.currentAction?.time || 0); stats.mixerTime = Number(chossid.animationMixer.time || 0); stats.seal = "explicit-chossid-mixer-advance-20260708-bh9";
  chossid.__awtsmoosPlayerAnimationStats = stats;
  if (chossid.olam) chossid.olam.__lastPlayerAnimationStats = stats;
}
export default { heesHawvoos(deltaTime) { if (!this.startedAll) { this.olam.ayshPeula("ready from chossid"); this.startedAll = true; } if (!this.olam.isPlayingCutscene) this.controls(deltaTime); if (this.olam && this.olam.isLookingForSomething) this.checkHover(this.olam, false); if (this.koach !== undefined && this.maxKoach !== undefined && this.koach < this.maxKoach) { this.koach += deltaTime * 2; if (this.koach > this.maxKoach) this.koach = this.maxKoach; if (!this.lastKoachUpdate || Date.now() - this.lastKoachUpdate > 1000) { if (typeof this.updateStatsUI === 'function') this.updateStatsUI(); this.lastKoachUpdate = Date.now(); } } if (typeof this.adjustDOF === 'function') this.adjustDOF(); if (typeof this.postProcessing === 'function') this.postProcessing(); Chai.prototype.heesHawvoos.call(this, deltaTime); advanceGlbMixer(this, deltaTime); } };
