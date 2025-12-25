//B"H
/**
 * Dialogue Methods - The art of speech and interaction for sentient beings.
 * Purified of experimental AI-Connect hooks to ensure stability.
 */
import Utils from "../../../utils.js";

export default {
    /**
     * B"H: Resolves the current message tree.
     */
    handleDialogue() {
        if (!this.dialogue) return;
        var sh = this.dialogue.shlichuseem;
        var def = this.dialogue.default;
        
        this.messageTree = () => {
            if(!sh) return def;
            var startShlichusID = sh[0];
            if(!startShlichusID) return def;
            var shl = this.olam.ayshPeula("get next shlichus data", startShlichusID)
            if(!shl) return def;

            var d = shl.dialogue;
            if(!d) return def;

            if(!d.intro) return def;
            var mid = d.middle;
            if(!mid) return def;
            var fin = d.finished;
            if(!fin) return def;

            var sID = shl.id
            var activeShlichus = this.olam.ayshPeula("get active shlichus", sID);
            var isDone = this.olam.ayshPeula("is shlichus completed", sID)

            if(!activeShlichus) {
                if(!isDone) return d.intro;
                else return def;
            }
            if(activeShlichus.completed) return fin;
            else return mid;
        }
    },

    selectResponse(responseIndex) {
        if(responseIndex !== undefined)
            this.currentSelectedMsgIndex = responseIndex;
        this.ayshPeula("selectedMessage", this.currentSelectedMsgIndex);
        return this.currentSelectedMsgIndex;
    },

    async toggleToOption(ind) {
        if(isNaN(ind) || ind < 0) return;
        var curM = this.currentMessage;
        if(!curM) return null;
        var resp = curM.responses;
        if(!resp) return null;

        if(this.currentSelectedMsgIndex != ind) {
            this.currentSelectedMsgIndex = ind;
            if(this.currentSelectedMsgIndex > resp.length - 1) {
                this.currentSelectedMsgIndex = resp.length - 1;
            }
            return (this.selectResponse(this.currentSelectedMsgIndex));
        } else {
            await this.selectOption();
        }
    },

    toggleOption() {
        var curM = this.currentMessage;
        if(!curM) return null;
        var resp = curM.responses;
        if(!resp) return null;
        this.currentSelectedMsgIndex++;
        this.currentSelectedMsgIndex %= resp.length;
        return (this.selectResponse(this.currentSelectedMsgIndex));
    },

    async selectOption() {
        await this.chooseResponse(this.currentSelectedMsgIndex);
    },

    /**
     * B"H: Handles the logical outcome of a dialogue choice.
     */
    async chooseResponse(responseIndex) {
        if(!this.currentMessage || !this.currentMessage.responses) return;
        var chosenResponse = this.currentMessage.responses[responseIndex];
        if (!chosenResponse) return;
        
        if (chosenResponse.nextMessageIndex !== undefined) {
            this.currentMessageIndex = chosenResponse.nextMessageIndex;
            this.currentSelectedMsgIndex = 0; 
        }
        
        if (chosenResponse.action && typeof chosenResponse.action === 'function') {
            await chosenResponse.action(this, this.nivraTalkingTo);
        }

        if(chosenResponse.close) {
            this.ayshPeula("close dialogue");
            this.currentMessageIndex = 0;
            this.state = "idle";
        }

        if(chosenResponse.completeShlichus) this.olam.ayshPeula("complete shlichus", chosenResponse.completeShlichus);
        if(chosenResponse.acceptShlichus) this.olam.ayshPeula("accept shlichus", chosenResponse.acceptShlichus, this);

        if (this.state === "talking" && !chosenResponse.close) {
            this.currentSelectedMsgIndex = 0; 
            this.ayshPeula("chose");
            this.selectResponse();
        }
    }
};
