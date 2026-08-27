
// B"H
/**
 * @file domCache.js
 * @brief Caches the physical existence of the console UI.
 * 
 * THE HYMN OF THE PRESERVED BODY:
 * We do not create what already stands,
 * Built by the wisdom of the Maker's hands.
 * We store the vessel in a secret place,
 * To keep its focus and its holy grace.
 * When the user returns to the console's door,
 * The same old friend is found upon the floor.
 */

export const ConsoleDOMCache = {
    inputArea: null,
    outputArea: null,
    logContainer: null,
    editorInstance: null,

    isManifested() {
        return this.inputArea !== null;
    }
};
