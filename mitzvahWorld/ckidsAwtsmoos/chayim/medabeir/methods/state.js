
/**
 * B"H
 * @file state.js
 * Manages state transitions and shlichus availability checks.
 */

export default {
    resetDialogueState() {
        this.currentMessageIndex = 0;
        this.currentSelectedMsgIndex = 0;
        this.nivraTalkingTo = null;
        this._tempTree = null; // B"H: Clear temp tree on exit so new data can be loaded
        this.state = "idle";
    },

    initShlichusChecker() {
        // Hook into start to check availability
        this.on("started", async () => {
            await this.ayshPeula("check shlichus availablity");
        });

        this.on("check shlichus availablity", async () => {
            var d = this?.dialogue?.shlichuseem;
            if(!d) return false;
            var isAvailable = this.olam.ayshPeula("is shlichus available", d);
       
            if(isAvailable === false) {
                await this.ayshPeula("change icon style", {
                    selector: ".ikar",
                    properties: { style: { fill: "silver" } }
                })
                return;
            }

            await this.ayshPeula("change icon style", {
                selector: ".ikar",
                properties: { style: { fill: "orange" } }
            })
        });
    }
};
