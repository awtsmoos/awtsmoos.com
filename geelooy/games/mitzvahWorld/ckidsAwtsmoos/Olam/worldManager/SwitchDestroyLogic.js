// B"H
/**
 * @module SwitchDestroyLogic
 * @description
 * THE CYCLE OF WORLDS - DESTRUCTION AND REBIRTH.
 *
 * "He builds worlds and destroys them." Every end is a new beginning.
 *
 * TIKKUN #1: destroyWorld() was writing this.socket.onmessage = fn
 * which is a dead write on OlamWorkerManager. Fixed to use this.socket.eved.onmessage.
 *
 * TIKKUN #2: switchWorlds() resets uiManager.started for a clean fresh world load.
 */
export default {
    /**
     * @async
     * @function destroyWorld
     * @returns {Promise}
     */
    async destroyWorld() {
        return new Promise((resolve) => {
            if (!this.socket || !this.socket.eved) {
                resolve(false);
                return;
            }

            // B"H: Write to eved.onmessage - the ACTUAL worker handler
            const previousHandler = this.socket.eved.onmessage;
            this.socket.eved.onmessage = e => {
                if (e.data && e.data.destroyed) {
                    this.socket.eved.onmessage = previousHandler;
                    delete this.socket;
                    resolve("Destroyed now creating new");
                } else if (typeof previousHandler === "function") {
                    previousHandler(e);
                }
            };

            this.socket.postMessage({ destroyWorld: true });
            this.started = false;
        });
    },

    /**
     * @async
     * @function switchWorlds
     * @param {Object} opts
     * @param {Object} [opts.worldDayuh]
     * @param {Object} [opts.gameState]
     */
    async switchWorlds({ worldDayuh, gameState } = {}) {
        if (gameState && gameState.shaym) {
            this.gameState[gameState.shaym] = gameState;
        }

        await this.destroyWorld();

        // B"H: Reset started so initializeForFirstTime can fire for new world
        if (this.uiManager) {
            this.uiManager.started = false;
        }

        var ld = this.ui.getHtml("loading");
        if (ld) {
            this.ui.setHtml(ld, { className: "loading" });
        }

        this.ui.htmlAction({
            shaym: "action loading",
            properties: { innerHTML: "Getting ready to start loading..." }
        });

        this.startWorld({ worldDayuh });
    }
};