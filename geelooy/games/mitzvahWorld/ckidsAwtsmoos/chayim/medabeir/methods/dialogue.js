import SiachManager from "./Siach/SiachManager.js";
import ShopManager from "./Siach/ShopManager.js";
import Utils from "../../../utils.js";

/**
 * B"H
 * @module DialogueLogic
 * 
 * Chapter 5: The Choice of the Soul.
 * When a Nivra speaks, it opens a gateway of choice.
 * The SiachManager is the guardian of this gate.
 */
export default {
    /**
     * @method handleDialogue
     * @description Initializes or triggers the Siach (Dialogue) process.
     */
    handleDialogue(chossid) {
        if (this.options?.hasShop) {
            if (!this.shopManager) {
                this.shopManager = new ShopManager(this, this.olam);
            }
            // B"H: silent

            this.state = 'talking';
            this.shopManager.openShop(chossid);
            return;
        }

        if (!this.siach) {
            this.siach = new SiachManager(this, this.olam);
        }
        
        // B"H: silent

        this.state = 'talking';
        this.siach.begin(chossid);
    },

    /**
     * @method dialogueControls
     * @description Bridges keyboard keys (1-9) to conversation choices.
     */
    dialogueControls(e) {
        const k = e.key;
        if (this.state !== 'talking' || !this.siach) return;

        const choice = parseInt(k, 10);
        if (!isNaN(choice) && choice > 0 && choice <= 9) {
             // B"H: silent

             this.siach.choose(choice - 1);
        }
    },

    /**
     * @method chooseResponse
     * @description Legacy bridge for clicking responses if needed.
     */
    chooseResponse(index) {
        if (this.siach) {
            this.siach.choose(index);
        }
    },

    /**
     * @method resetDialogueState
     * @description Returns the Nivra to a state of silent contemplation.
     */
    resetDialogueState() {
        if (this.siach) {
            this.siach.end();
        }
        if (this.shopManager) {
            this.shopManager.closeShop();
        }
        this.state = 'idle';
    },

    /**
     * @method ayshPeula
     * @description Intercepts standard interaction to trigger Siach.
     */
    "accepted interaction"(chossid) {
        this.handleDialogue(chossid);
    }
};
