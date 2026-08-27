
// B"H
/**
 * @file GitSyncPolicy.js
 * @description
 * Central policy for Vibe GitHub auto-update after writes.
 */

export const GitSyncPolicy = {
    getMode() {
        return localStorage.getItem('awtsmoos.vibe.git.mode') || 'off';
    },

    setMode(mode) {
        const allowed = new Set(['off', 'after-each-write', 'after-batch', 'ask']);
        const finalMode = allowed.has(mode) ? mode : 'off';
        localStorage.setItem('awtsmoos.vibe.git.mode', finalMode);
        return finalMode;
    },

    shouldSyncAfterEachWrite() {
        return this.getMode() === 'after-each-write';
    },

    shouldSyncAfterBatch() {
        return this.getMode() === 'after-batch';
    },

    shouldAsk() {
        return this.getMode() === 'ask';
    }
};
