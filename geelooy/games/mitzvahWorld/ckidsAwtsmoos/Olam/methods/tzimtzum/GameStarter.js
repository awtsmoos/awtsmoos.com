
/**
 * B"H
 * @module GameStarter
 * @description
 * The moment the Breath of Life is blown into the vessel. 
 * This module instantiates all physical forms, syncs the game state, and signals the engine to begin.
 */

export default class GameStarter {
    /**
     * @async
     * @function start
     * @description Initiates the loading sequence and state application.
     * @param {Object} olam - The world instance.
     * @param {Object} info - The consolidated world data.
     * @returns {Promise<Array>} The manifested entities.
     */
    static async start(olam, info) {
        console.log("B\"H - ⚡ INTENSE LOG: Igniting the Spark of Life (GameStarter)...");

        // Apply global variables and states
        if (info.vars) olam.vars = { ...info.vars };
        if (info.assets) olam.setAssets(info.assets);
        if (info.set) {
            try {
                Object.assign(olam, info.set);
                if (olam.userProgressManager) {
                    olam.userProgressManager.load();
                }
            } catch(e) {
                console.error("B\"H - ⚡ INTENSE ERROR: Failed to assign global set properties.", e);
            }
        }

        // Load the entities!
        let loaded = [];
        try {
            loaded = await olam.loadNivrayim(info.nivrayim);
            console.log("B\"H - ⚡ INTENSE LOG: All Nivrayim manifested.");
        } catch(e) {
            console.error("B\"H - ⚡ INTENSE ERROR: Problem loading nivrayim", e);
            olam.ayshPeula("error", {
                code: "NO_LOAD_NIVRAYIM",
                details: e,
                message: "Couldn't load the Nivrayim"
            });
            return null;
        }

        // Sync state if returning to a previously saved world
        const st = info.gameState && info.gameState[olam.shaym];
        if (st && st.shaym === olam.shaym) {
            console.log("B\"H - ⚡ INTENSE LOG: Restoring previous timeline state.");
            olam.setGameState(st);
        } else {
            console.log("B\"H - ⚡ INTENSE LOG: Forging a brand new timeline.");
        }

        // Signal the heavens
        olam.ayshPeula("ready", olam, loaded);
        olam.ayshPeula("reset loading percentage");
        olam.ayshPeula("setup map");
        
        console.log("B\"H - ⚡ INTENSE LOG: The World is Alive. Sending ready signal to worker manager.");
        olam.ayshPeula("ready to start game");

        return loaded;
    }
}
