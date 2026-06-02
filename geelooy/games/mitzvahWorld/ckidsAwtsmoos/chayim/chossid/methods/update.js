// B"H
/**
 * @file update.js
 * @description
 * Chapter 42: Every Frame Took The Smoothed Chai.
 *
 * Each frame is a new breath from the Awtsmoos. The Chossid reads input,
 * checks interactions, refreshes tiny UI systems, then returns to the cache-
 * busted Chai physics that smooths horizontal velocity.
 */
import Chai from "../../chai/index.js?v=smooth-velocity-turn-20260602-bh9";

export default {
    /**
     * Updates the player once per frame.
     *
     * @param {number} deltaTime Seconds since previous frame.
     * @returns {void}
     */
    heesHawvoos(deltaTime) {
        if (!this.startedAll) {
            this.olam.ayshPeula("ready from chossid");
            this.startedAll = true;
        }
        if (!this.olam.isPlayingCutscene) this.controls(deltaTime);
        if (this.olam && this.olam.isLookingForSomething) this.checkHover(this.olam, false);

        if (this.koach !== undefined && this.maxKoach !== undefined && this.koach < this.maxKoach) {
            this.koach += deltaTime * 2.0;
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
