
import TzimtzumOrchestrator from "./orchestrator/index.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

/**
 * @file index.js (Tzimtzum)
 * @description
 * THE PORTAL OF BEREISHIS
 * 
 * Chapter 0: The Absolute Nothingness.
 * This class serves as the singular entrance to the world-creation logic.
 * It invokes the intensely modular TzimtzumOrchestrator to perform the 
 * complex dance of data, UI, and engine initialization without overwhelming a single file.
 */

export default class TzimtzumManager {
    /**
     * @async
     * @function tzimtzum
     * @description The high-level call to begin existence.
     * @param {Object} payload - User and System data.
     */
    async tzimtzum(payload) {
        return await TzimtzumOrchestrator.execute(this, payload);
    }
}
