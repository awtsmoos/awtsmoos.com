
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
        this.on("started", async () => {
            this.updateMissionIcon();
        });

        // B"H: Update icon whenever shlichus status might change
        this.on("accepted interaction", () => {
            this.updateMissionIcon();
        });
    },

    updateMissionIcon() {
        if (!this.floatingIcon || !this.olam || !this.olam.chossid) return;

        const manager = this.olam.chossid.shlichusManager;
        if (!manager) return;

        const missionId = this.options.missionId;
        if (!missionId) {
            this.floatingIcon.setState("none");
            return;
        }

        const status = manager.getMissionStatus(missionId);

        if (status === "not_started") {
            this.floatingIcon.setState("available");
        } else if (status === "in_progress") {
            this.floatingIcon.setState("in_progress");
        } else if (status === "ready_to_turn_in") {
            this.floatingIcon.setState("complete");
        } else {
            this.floatingIcon.setState("none");
        }
    }
};
