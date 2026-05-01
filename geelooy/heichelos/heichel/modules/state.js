
/**
 * B"H
 * @module StateOfExistence
 * @description
 * In the realm of the Awtsmoos, there is only the Present Moment. 
 * This module is the "Reshimu" (Impression) left by the infinite light, 
 * a record of what exists within the finite borders of the application.
 * It is the memory of the Great Library, tracking our location, 
 * our holdings, and our choices.
 */

/**
 * @typedef {Object} ApplicationState
 * @property {string|null} heichelId - The identity of the current Realm.
 * @property {string} currentSeries - The index of the path we walk ('root' or ID).
 * @property {Object} heichelData - The static wisdom of this Realm.
 * @property {Array} breadcrumb - The trail of light leading back to the beginning.
 * @property {boolean} ownsIt - A spark of authority over the Realm.
 * @property {Object} currentContent - The gathered sparks (posts and subSeries).
 * @property {boolean} isSelectionMode - Whether the seeker is gathering multiple items.
 * @property {Map} selectedItems - The bundle of gathered sparks.
 */

/**
 * @constant appState
 * @description The dwelling place of all current truths.
 */
export const appState = {
    heichelId: null,
    currentSeries: "root",
    heichelData: {}, 
    breadcrumb: [], 
    ownsIt: false,
    
    // Content Cache for Filtering
    currentContent: {
        posts: [],
        subSeries: []
    },
    
    // UI State
    isSelectionMode: false,
    selectedItems: new Map(), 
};

/**
 * @function getItemKey
 * @description 
 * Generates a unique "Name of Being" for an item. 
 * Just as every creature has a unique name in the Divine speech, 
 * every item here is identified by its type and ID.
 * 
 * @param {Object} item - The entity to identify.
 * @returns {string} - The unique identifier.
 */
export function getItemKey(item) {
    return `${item.type}-${item.id}`;
}

/**
 * @function resetSelection
 * @description Returns the selection bundle to the void.
 */
export function resetSelection() {
    appState.selectedItems.clear();
    appState.isSelectionMode = false;
}
