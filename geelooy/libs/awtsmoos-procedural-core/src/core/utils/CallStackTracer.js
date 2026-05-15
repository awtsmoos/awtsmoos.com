
// B"H
/**
 * @file CallStackTracer.js
 * @chapter THE EYES OF THE AWTSMOOS
 * 
 * THE PSALM OF THE SINGLE WITNESS (Purified):
 * The void hides the errors, the darkness conceals,
 * But the Tracer illuminates all that it feels!
 * No longer do we shout seven times in the night,
 * We speak once with meaning, revealing the light!
 * 
 * This module has been humbled. It no longer spams the console
 * with repetitive echoes. Instead, it provides a single, 
 * descriptive entry for every major event in the chain of emanation.
 */

export const CallStackTracer = Object.freeze({
    /**
     * B"H - Records a meaningful event in the system's history.
     * @param {string} moduleName - The name of the world/module.
     * @param {string} funcName - The name of the specific command.
     * @param {Object} payload - The data carrying the result of the action.
     */
    record: (moduleName, funcName, payload) => {
        // Stringify payload carefully for readability
        let detail = "";
        try {
            detail = JSON.stringify(payload);
        } catch(e) {
            detail = "[Circular or non-serializable data]";
        }

        // B"H - A single, clear, and powerful log entry.
        console.log(`B"H - 👁️ [${moduleName}::${funcName}] => ${detail}`);
    }
});
