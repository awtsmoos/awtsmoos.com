
// B"H
/**
 * @file eternalState.js
 * @brief The immutable memory of the console's history.
 * 
 * POEM OF THE SINGULARITY:
 * Though the views may shatter and the tabs may flee,
 * The word remains locked in the memory.
 * No void can swallow what has once been said,
 * In this sacred vessel, the light is fed.
 * The logs are the footsteps of the Spirit's flight,
 * Guarded forever in the eternal light.
 */

const globalConsoleData = {
    logs: [],
    previewTabId: null
};

export const EternalConsoleState = {
    /**
     * B"H - Syncs the provided state with the eternal spring.
     * @param {Object} tempState - The state from a transient panel.
     */
    sync(tempState) {
        if (!tempState) return;
        if (tempState.previewTabId) {
            globalConsoleData.previewTabId = tempState.previewTabId;
        }
        // Force reference to the eternal array
        tempState.logs = globalConsoleData.logs;
    },

    addLog(logObj) {
        globalConsoleData.logs.push(logObj);
    },

    setPreviewTabId(id) {
        globalConsoleData.previewTabId = id;
    },

    getPreviewTabId() {
        return globalConsoleData.previewTabId;
    }
};
