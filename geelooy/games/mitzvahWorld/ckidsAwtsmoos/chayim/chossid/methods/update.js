
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
