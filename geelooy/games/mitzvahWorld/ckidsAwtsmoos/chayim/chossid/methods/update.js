// B"H
/**
 * @file update.js
 * @description
 * Chapter 387: Every frame receives the exact-foot Chai.
 */
import Chai from "../../chai/index.js?v=zone-reality-20260614-bh812";

export default {
  heesHawvoos(deltaTime) {
    if (!this.startedAll) { this.olam.ayshPeula("ready from chossid"); this.startedAll = true; }
    if (!this.olam.isPlayingCutscene) this.controls(deltaTime);
    if (this.olam && this.olam.isLookingForSomething) this.checkHover(this.olam, false);
    if (this.koach !== undefined && this.maxKoach !== undefined && this.koach < this.maxKoach) {
      this.koach += deltaTime * 2;
      if (this.koach > this.maxKoach) this.koach = this.maxKoach;
      if (!this.lastKoachUpdate || Date.now() - this.lastKoachUpdate > 1000) {
        if (typeof this.updateStatsUI === 'function') this.updateStatsUI();
        this.lastKoachUpdate = Date.now();
      }
    }
    if (typeof this.adjustDOF === 'function') this.adjustDOF();
    if (typeof this.postProcessing === 'function') this.postProcessing();
    Chai.prototype.heesHawvoos.call(this, deltaTime);
  }
};
