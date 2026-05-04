

/**
 * B"H
 * @file update.js
 * Main update loop for Chossid.
 */
import Medabeir from "../../medabeir/index.js";

export default {
    heesHawvoos(deltaTime) {
        if(!this.startedAll) {
            this.olam.ayshPeula("ready from chossid")
            this.startedAll = true;
        }
		if(!this.olam.isPlayingCutscene) {
			this.controls(deltaTime);
		}

        // B"H: Continuous Interaction Check
        // Ensure we check for hover targets even if mouse isn't moving (e.g. walking into range)
        if(this.olam && this.olam.isLookingForSomething) {
            this.checkHover(this.olam, false); // false = allow HTML updates
        }

        // B"H: Koach Regeneration (Mana)
        if (this.koach !== undefined && this.maxKoach !== undefined) {
            if (this.koach < this.maxKoach) {
                // Regenerate 1 koach every second roughly (delta is roughly 1/60th)
                this.koach += deltaTime * 2.0; 
                if (this.koach > this.maxKoach) this.koach = this.maxKoach;
                
                // Throttle UI updates to avoid spamming
                if (!this.lastKoachUpdate || (Date.now() - this.lastKoachUpdate > 1000)) {
                    if (typeof this.updateStatsUI === 'function') this.updateStatsUI();
                    this.lastKoachUpdate = Date.now();
                }
            }
        }

        // B"H: Safety check for function existence
        if(typeof this.adjustDOF === 'function') {
            this.adjustDOF();
        }
        
        if(typeof this.postProcessing === 'function') {
            this.postProcessing();
        }
        
        Medabeir.prototype.heesHawvoos.call(this, deltaTime);
    }
};
