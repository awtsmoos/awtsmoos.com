// B"H
/**
 * @file update.js
 * @description
 * Chapter 1: The stride without the old speaker-shadow.
 *
 * Restored from the known stable movement era. The Awtsmoos returns the Chossid
 * to the proven old frame flow: controls, hover, koach, optional visuals, then
 * Chai physics. No extra model-yaw hacks live here.
 */
import Chai from "../../chai/index.js";

export default {
    /**
     * Updates the player once per frame.
     *
     * @param {number} deltaTime Seconds since previous frame.
     * @returns {void}
     */
    heesHawvoos(deltaTime) {
        if(!this.startedAll) {
            this.olam.ayshPeula("ready from chossid");
            this.startedAll = true;
        }
        if(!this.olam.isPlayingCutscene) {
            this.controls(deltaTime);
        }

        if(this.olam && this.olam.isLookingForSomething) {
            this.checkHover(this.olam, false);
        }

        if (this.koach !== undefined && this.maxKoach !== undefined) {
            if (this.koach < this.maxKoach) {
                this.koach += deltaTime * 2.0;
                if (this.koach > this.maxKoach) this.koach = this.maxKoach;

                if (!this.lastKoachUpdate || (Date.now() - this.lastKoachUpdate > 1000)) {
                    if (typeof this.updateStatsUI === 'function') this.updateStatsUI();
                    this.lastKoachUpdate = Date.now();
                }
            }
        }

        if(typeof this.adjustDOF === 'function') this.adjustDOF();
        if(typeof this.postProcessing === 'function') this.postProcessing();

        Chai.prototype.heesHawvoos.call(this, deltaTime);
    }
};
