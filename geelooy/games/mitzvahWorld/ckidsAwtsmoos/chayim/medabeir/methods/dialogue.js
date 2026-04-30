
/**
 * B"H
 * @module DialogueLogic
 */
import Utils from "../../../utils.js";

export default {
    /**
     * @method dialogueControls
     * @description Bridges keyboard keys (1-9) to conversation choices.
     */
    dialogueControls(e) {
        const k = e.key;
        if (!this.nivraTalkingTo || this.state !== 'talking') return;

        // B"H: Extracting numeric input from key text (1 through 9)
        const choice = parseInt(k, 10);
        if (!isNaN(choice) && choice > 0 && choice <= 9) {
             console.log(`B"H - 👄 Keyed Speech Choice: ${choice}`);
             this.chooseResponse(choice - 1);
        }
    },

    chooseResponse(index) {
        const msg = this.currentMessage;
        if (!msg || !msg.responses || !msg.responses[index]) return;

        const res = msg.responses[index];
        console.log(`B"H - 👄 NPC Response selected: "${res.text}"`);

        // Proceed through the chain
        if (res.nextMessageIndex !== undefined) {
            this.currentMessageIndex = res.nextMessageIndex;
            this.currentSelectedMsgIndex = 0;
            this.ayshPeula("chose");
        }
        
        // Execute divine action
        if (typeof res.action === 'function') {
            res.action(this, this.nivraTalkingTo);
        }

        // B"H: Bridge with missions
        if (res.acceptShlichus) {
             this.olam.ayshPeula("accept shlichus", res.acceptShlichus, this);
        }
        
        if (res.completeShlichus) {
             this.olam.ayshPeula("complete shlichus", res.completeShlichus);
        }

        if (res.close) {
            this.ayshPeula("close dialogue", res.close);
        } else {
             this.selectResponse();
        }
    }
};
