
// B"H
/**
 * @file sentinel.js
 * @brief Guardian of temporal navigation intent.
 */

export const TabSentinel = {
    _latestToken: 0,

    /**
     * @function startNewIntent
     * @returns {number} A unique token for this specific activation attempt.
     */
    startNewIntent() {
        return ++this._latestToken;
    },

    /**
     * @function isIntentStale
     * @param {number} token - The token received at the start of the async chain.
     * @returns {boolean} True if a newer intent has started.
     */
    isIntentStale(token) {
        if (token !== this._latestToken) {
            console.warn(`B"H - [Sentinel] Stale intent ${token} aborted by newer intent ${this._latestToken}.`);
            return true;
        }
        return false;
    }
};
