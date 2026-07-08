
/**
 * @file index.js (TzimtzumOrchestrator)
 * @description
 * THE DIVINE CONDUCTOR (HA-MENATZEACH)
 * 
 * Chapter 1: The First Breath.
 * The Tzimtzum is now perfectly fragmented into 6 modular stages of emanation.
 * Each stage represents a Sefirah (an emanation) of the creation process,
 * ensuring no single vessel holds too much light, protecting the engine from crashing.
 */

import Stage1Data from "./stages/Stage1Data.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import Stage2Events from "./stages/Stage2Events.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import Stage3Fonts from "./stages/Stage3Fonts.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import Stage4Components from "./stages/Stage4Components.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import Stage5UI from "./stages/Stage5UI.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import Stage6Ignition from "./stages/Stage6Ignition.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class TzimtzumOrchestrator {
    /**
     * @function execute
     * @description Orchestrates the 6 stages of creation with modular precision.
     */
    static async execute(olam, { systemInfo = {}, userInfo = {} } = {}) {
        // B"H: silent


        try {
            // Stage 1: Data Synthesis (Chochmah)
            const info = await Stage1Data.merge(systemInfo, userInfo);
            olam.baseInfo = userInfo;

            // Stage 2: Event Binding (Binah)
            Stage2Events.bind(olam, info);

            // Stage 3: Holy Language (Chesed)
            await Stage3Fonts.load(olam);

            // Stage 4: Component Manifestation (Gevurah)
            await Stage4Components.manifest(olam, info);

            // Stage 5: UI Construction (Tiferet)
            await Stage5UI.build(olam, info);

            // Stage 6: The Great Spark (Yesod & Malchus)
            return await Stage6Ignition.ignite(olam, info);

        } catch (e) {
            console.error("B\"H - 🚨 THE ORCHESTRATION SHATTERED:", e);
            olam.ayshPeula("error", {
                code: "ORCHESTRATION_FAIL",
                details: e.stack
            });
        }
    }
}
