
// B"H
/**
 * @module VeilDissolver
 * @description
 * * Chapter 31: The Messenger of Appearance
 * Deep in the worker, the first frame is Rendered. A signal is sent!
 * This handler catches that signal in the Main Thread.
 * * It uses the VeilController to perform the sacred act of revealing the world.
 * Without this bridge, the UI would remain frozen, even as the world 
 * pulses with life in the background thread.
 */
import VeilController from "../../../uiManager/logic/VeilController.js";
import LoadingProgress from "../../../uiManager/logic/LoadingProgressBridge.js?v=loading-proof-mobile-20260706-bh2";

export default function setupVeilDissolver(manager) {
    const controller = new VeilController(manager.myUi);

    return {
        /**
         * @function hideLoadingScreen
         * @description The terminal command to end the loading phase.
         */
        hideLoadingScreen() {
            controller.liftVeil();
        },

        /**
         * @function resetPercentage
         * @description Legacy callers may still ask for a reset; the visible
         * loader records that request but keeps the monotonic display floor.
         */
        resetPercentage() {
            const total = Math.max(LoadingProgress.snapshot?.().total || 0, 18);
            LoadingProgress.update({
                stage: "legacy-veil-reset-held",
                total,
                world: total,
                worker: total,
                action: "Continuing load...",
                subAction: "legacy reset request ignored"
            });
            manager.myUi.htmlAction({
                shaym: "loading bar",
                properties: { style: { width: `${total}%` } }
            });
        }
    };
}
