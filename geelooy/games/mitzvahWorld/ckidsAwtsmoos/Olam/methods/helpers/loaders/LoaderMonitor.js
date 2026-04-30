
/**
 * @file LoaderMonitor.js
 * @description
 * ==============================================================================
 * 🔭 THE INSPECTION OF THE VESSELS (BINAH) 🔭
 * ==============================================================================
 * "Open for me the gates of righteousness."
 * 
 * To ensure absolute lightning-fast execution and clear vision, we have
 * stripped away the endless chatter. The monitor will only scream if a 
 * vessel shatters, or sing when a massive milestone is reached.
 */

export default class LoaderMonitor {
    /**
     * @function logLoad
     * @description Records the descent of an asset. Now highly filtered.
     */
    static logLoad(type, url, status = "INIT") {
        const timestamp = new Date().toLocaleTimeString();
        
        // B"H: Only cry out if there is destruction or final completion of a massive stage.
        if (status === "ERROR" || status === "FAILED" || status === "SHATTERED_VESSEL" || status === "ABORTED") {
            console.error(`B"H - 🚨 [${timestamp}] VESSEL SHATTERED: (${type}) ${url}`);
        } else if (status === "DONE") {
            // Optional: minimal success log for huge files if needed.
            // console.log(`%cB"H - 📦 VESSEL SECURED: (${type})`, "color: #00ffed;");
        }
        // Silence the rest (INIT_BREATH, PAINTED, etc.) to keep the console pure!
    }

    /**
     * @function logStage
     * @description Marks a major conceptual milestone of emanation.
     */
    static logStage(stageName) {
        console.log(`%cB"H - 🛡️ SYSTEM SEFIRAH ATTAINED: ${stageName}`, "background: #1b2064; color: #fff; padding: 5px 10px; border-radius: 5px; border: 1px solid #00f3ff;");
    }
}
