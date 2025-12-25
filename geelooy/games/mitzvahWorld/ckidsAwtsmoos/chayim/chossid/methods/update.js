// B"H
/**
 * update.js - The constant pulse of the player's existence.
 */
import Medabeir from "../../medabeir/index.js";

export default {
    heesHawvoos(deltaTime) {
        if(!this.startedAll) {
            this.olam.ayshPeula("ready from chossid")
            this.startedAll = true;
        }

        if (this.olam.keyStates["Slash"] && !this._cmdToggle) {
            this._cmdToggle = true;
            this.olam.ayshPeula("ui event", "commandConsole", { toggle: true });
        } else if (!this.olam.keyStates["Slash"]) { this._cmdToggle = false; }

		if(!this.olam.isPlayingCutscene && !this.olam.showingImportantMessage) {
			this.controls(deltaTime);
		}

        // B"H: Chromatic Ratzon effect
        if (this.moving.running && (this.moving.forward || this.moving.stridingLeft || this.moving.stridingRight)) {
            if (!this._ratzoning) {
                this._ratzoning = true;
                this.olam.htmlAction({
                    shaym: "canvasEssence",
                    properties: { style: { filter: "contrast(1.2) saturate(1.4) brightness(1.1)" } }
                });
            }
        } else if (this._ratzoning) {
            this._ratzoning = false;
            this.olam.htmlAction({
                shaym: "canvasEssence",
                properties: { style: { filter: "none" } }
            });
        }

        if(this.olam && this.olam.isLookingForSomething) {
            this.checkHover(this.olam, false);
        }

        Medabeir.prototype.heesHawvoos.call(this, deltaTime);
    }
};