// B"H
/**
 * @file ui.js
 * @description
 * ╔═══════════════════════════════════════════════════════════╗
 * ║  THE MESSENGER — User Interface Communication              ║
 * ║                                                             ║
 * ║  "And he shall write it upon the doorposts..."            ║
 * ║  (Devarim 6:9)                                              ║
 * ║                                                             ║
 * ║  This module projects information from the Essence of the  ║
 * ║  door onto the overlay of the world for the player to read.║
 * ╚═══════════════════════════════════════════════════════════╝
 */

export default {
    /**
     * @method _showInteractionPrompt
     * @description Shows the HUD overlay with the interaction key hint.
     */
    _showInteractionPrompt() {
        if (!this.olam) return;
        this.olam.ayshPeula("ui event", "interaction-prompt", {
            showInteraction: {
                text: `to ${this.isOpen ? 'Close' : 'Open'} the Threshold`,
                key: this.interactKey
            }
        });
    },

    /**
     * @method _hideInteractionPrompt
     * @description Hides the HUD overlay.
     */
    _hideInteractionPrompt() {
        if (!this.olam) return;
        this.olam.ayshPeula("ui event", "interaction-prompt", {
            hideInteraction: true
        });
    }
};
