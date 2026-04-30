
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
         * @description Returns the progress measure to the Void (0%).
         */
        resetPercentage() {
            manager.myUi.htmlAction({
                shaym: "loading bar",
                properties: { style: { width: "0%" } }
            });
        }
    };
}
