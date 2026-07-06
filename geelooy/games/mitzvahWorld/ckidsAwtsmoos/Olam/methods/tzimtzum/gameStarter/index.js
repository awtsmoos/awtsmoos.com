
/**
 * @file index.js (GameStarterHub)
 * @description
 * 🚀 THE FINAL SPARK (YESOD & MALCHUS) 🚀
 * 
 * Breaking down the massive initialization into clear, logical steps.
 */
import CosmicConstants from "./CosmicConstants.js";
import SoulSummoner from "./SoulSummoner.js";
import TimeSync from "./TimeSync.js";
import FinalEmanation from "./FinalEmanation.js";

export default class GameStarterHub {
    static async start(olam, info) {
        // B"H: silent


        const updateLog = (pct, act) => {
            // B"H: silent

            olam.ayshPeula("increase loading percentage", { total: pct, reset: false, action: act });
        };

        // 1. Primordial Settings
        updateLog(10, "Establishing Cosmic Constants...");
        CosmicConstants.apply(olam, info);

        // 2. Manifesting the Host (Nivrayim)
        updateLog(30, "Summoning the Souls and Vessels...");
        const loaded = await SoulSummoner.summon(olam, info);
        if (!loaded) return null; // Failure caught inside summoner

        // 3. Time-Sync
        updateLog(85, "Synchronizing Timelines...");
        TimeSync.sync(olam, info);

        // 4. Final Emanation
        updateLog(100, "The World is Complete. Opening your eyes...");
        FinalEmanation.execute(olam, loaded);

        return loaded;
    }
}
