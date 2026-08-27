
// B"H
/**
 * @file eternalState.js
 * @brief The immutable memory of the console's history.
 */

const globalConsoleData = {
    logs: [],
    commandHistory: [], // B"H - Added history tracking
    previewTabId: null
};

export const EternalConsoleState = {
    /**
     * B"H - Syncs the provided state with the eternal spring.
     */
    sync(tempState) {
        if (!tempState) return;
        if (tempState.previewTabId) {
            globalConsoleData.previewTabId = tempState.previewTabId;
        }
        // Force reference to the eternal arrays
        tempState.logs = globalConsoleData.logs;
        tempState.commandHistory = globalConsoleData.commandHistory;
    },

    addLog(logObj) {
        globalConsoleData.logs.push(logObj);
    },
    
    addToHistory(cmd) {
        // Prevent duplicates at the end
        const last = globalConsoleData.commandHistory[globalConsoleData.commandHistory.length - 1];
        if (last !== cmd) {
            globalConsoleData.commandHistory.push(cmd);
        }
    },
    
    getHistory() {
        return globalConsoleData.commandHistory;
    },

    setPreviewTabId(id) {
        globalConsoleData.previewTabId = id;
    },

    getPreviewTabId() {
        return globalConsoleData.previewTabId;
    }
};
