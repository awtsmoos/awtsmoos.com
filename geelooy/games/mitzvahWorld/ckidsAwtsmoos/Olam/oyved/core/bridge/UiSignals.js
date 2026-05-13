
/**
 * B"H
 * @module UiSignals
 * @description
 * 🪞 THE MIRROR OF PROGRESS 🪞
 * Sends basic loading and hiding commands to the main thread UI.
 */
export class UiSignals {
    static bind(olam) {
        olam.on("hide loading screen", () => {
            self.postMessage({ type: "hideLoadingScreen" });
        });

        olam.on("increased percentage", (info = {}) => {
            self.postMessage({ type: "increasedOlamLoading", payload: info });
        });
    }
}
