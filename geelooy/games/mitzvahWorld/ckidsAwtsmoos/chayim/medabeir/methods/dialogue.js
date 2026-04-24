/**
 * B"H
 * @file dialogue.js
 * Handles the logic for conversation trees, response selection, and dynamic tree generation.
 * This is a MIXIN for the Medabeir entity, NOT the Dialogue UI handler.
 */
import Utils from "../../../utils.js";

export default {
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

            if(activeShlichus.completed) {
                return fin;
            } else {
                return mid;
            }
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
            
            var selected = resp[this.currentSelectedMsgIndex];
            if(!selected) return null;
            
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
        
        var selected = resp[this.currentSelectedMsgIndex];
        if(!selected) return null;

        return (this.selectResponse(this.currentSelectedMsgIndex));
    },

    async selectOption() {
        await this.chooseResponse(this.currentSelectedMsgIndex);
    },

    // Navigate to a specific response based on player choice
    async changeResponseAndGoToIt({msgIndex=0, message, responses} = {}) {
        // B"H: CRITICAL FIX for Dynamic Trees
        // We utilize _tempTree to hold dynamic UI states (like shops) that are not saved to DB
        
        if (!this._tempTree) {
            const currentTree = typeof(this._messageTreeFunction) == "function" ? 
                this._messageTreeFunction(this) : this._messageTree;
            
            // B"H: Use CopyObj to preserve functions!
            this._tempTree = Utils.copyObj(currentTree);
        }

        var msg = this._tempTree[msgIndex];
        
        if(msg) {
            try {
                msg.message = message;
                msg.responses = responses;
                this.currentSelectedMsgIndex = 0;
                this.currentMessageIndex = msgIndex;
                this.ayshPeula("chose");
                this.selectResponse();
            } catch(e) {
                console.log(e);
            }
        } else {
            console.log("Didn't do it")
        }
    },

    async chooseResponse(responseIndex) {
        var me = this;
        // Defensive check
        if(!this.currentMessage || !this.currentMessage.responses) return;

        var chosenResponse = this.currentMessage.responses[responseIndex];
       
        if (!chosenResponse) return;
       
        if (chosenResponse.nextMessageIndex !== undefined) {
            this.currentMessageIndex = chosenResponse.nextMessageIndex;
            this.currentSelectedMsgIndex = 0; 
        }
        
        if (chosenResponse.action && typeof chosenResponse.action === 'function') {
            var keepGoing = await chosenResponse.action(this, this.nivraTalkingTo);
        }

        if(chosenResponse.changeResponseAndGoToIt) {
            await this.changeResponseAndGoToIt(chosenResponse.changeResponseAndGoToIt);
        }

        if(chosenResponse.close) {
            var str = chosenResponse.close;
            if(typeof(str) == "string") {
                this.ayshPeula("close dialogue", str);
            }
            // B"H: Important cleanup for dynamic trees - ensure we revert to main tree next time
            this._tempTree = null; 
            this.currentMessageIndex = 0;
            this.state = "idle";
        }

        if(chosenResponse.completeShlichus) {
            this.olam.ayshPeula("complete shlichus", chosenResponse.completeShlichus)
        }
        
        if(chosenResponse.remove) {
            me.olam.sealayk(me);
			me.olam.sealayk(me.av);
        }

        if(chosenResponse.acceptShlichus) {
            var id = chosenResponse.acceptShlichus;
            this.olam.ayshPeula("accept shlichus", id, me)
        }

        // Refresh UI if still talking
        if (this.state === "talking" && !chosenResponse.close) {
            this.currentSelectedMsgIndex = 0; 
            this.ayshPeula("chose");
            this.selectResponse();
        }
    }
};