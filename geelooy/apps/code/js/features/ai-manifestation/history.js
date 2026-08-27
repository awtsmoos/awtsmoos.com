// B"H
// FILE: js/features/ai-manifestation/history.js

const sessionHistory = [];

export const HistoryManager = {
    addBatch(folderPath, changes) {
        const entry = {
            id: Date.now(),
            timestamp: new Date().toLocaleTimeString(),
            folder: folderPath,
            changes: changes, // Array of change objects
            count: changes.length
        };
        sessionHistory.unshift(entry); // Newest first
    },

    getHistory() {
        return sessionHistory;
    },

    clear() {
        sessionHistory.length = 0;
    }
};