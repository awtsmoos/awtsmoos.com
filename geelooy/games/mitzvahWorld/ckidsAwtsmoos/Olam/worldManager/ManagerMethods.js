
/**
 * @file ManagerMethods.js
 * @description
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║   CHAPTER 2: THE ADMINISTRATIVE METHODS OF THE WORLD MANAGER           ║
 * ║                                                                          ║
 * ║  These are the housekeeping functions of ManagerOfAllWorlds:            ║
 * ║  setOnmessage, onerror, and other cross-cutting concerns.               ║
 * ║                                                                          ║
 * ║  THE TIKKUN FOR setOnmessage:                                           ║
 * ║  The old `setOnmessage` wrote `this.socket.onmessage = fn` where       ║
 * ║  `this.socket` is an OlamWorkerManager instance. That class has NO     ║
 * ║  `.onmessage` property — messages route via `eved.onmessage` which     ║
 * ║  is already set in OlamWorkerManager's constructor.                     ║
 * ║                                                                          ║
 * ║  The `loadedWorld` case is now handled by worldHandlers.loadedWorld.   ║
 * ║  The `switchWorlds` case is also routed by worldHandlers.switchWorlds. ║
 * ║  So setOnmessage is now a logging no-op — kept for backward compat.    ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

export default {

    /**
     * @function setOnmessage
     * @description
     * Previously attempted to set `this.socket.onmessage = fn` which was
     * a dead write (OlamWorkerManager routes via eved.onmessage + dispatcher).
     *
     * Now this function is a no-op with diagnostic logging.
     * All message routing is handled by:
     *   - ikarOyvedManager.js → _interceptWorkerMessage (vessel_ready, pawsawch_digested)
     *   - worker/messageHandler.js → handleMessageEvent (all other messages)
     *   - worker/handlers/world.js → loadedWorld, switchWorlds, destroyWorld
     */
    setOnmessage() {
        // B"H: silent

        // B"H: silent

        // B"H: silent


        if (!this.socket) {
            console.warn("B\"H - ⚠️ setOnmessage: this.socket is not set yet.");
            return;
        }

        // B"H: Kept as a safety net for the `switchWorlds` case that might
        // arrive via an unusual code path not covered by the dispatcher.
        // This does NOT override eved.onmessage — it's on the manager object itself.
        // The real routing happens through OlamWorkerManager's eved.onmessage.
        this.socket._switchWorldsCallback = (data) => {
            if (data.switchWorlds) {
                this.switchWorlds({ ...data.switchWorlds });
            }
            if (data.loadedWorld) {
                // B"H: silent

                this.uiManager.makeGameMenu();
            }
        };
    },

    /**
     * @function onerror
     * @description
     * Handles Worker errors that surface to the main thread.
     * @param {ErrorEvent} e
     */
    onerror(e) {
        console.error("B\"H - 🚨 ManagerOfAllWorlds: Worker error:", e);
    }
};
