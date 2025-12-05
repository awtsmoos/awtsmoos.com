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

        this.adjustDOF()
        this.postProcessing();
        
        Medabeir.prototype.heesHawvoos.call(this, deltaTime);
    }
};