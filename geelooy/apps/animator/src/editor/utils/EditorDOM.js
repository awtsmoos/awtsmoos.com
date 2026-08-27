
// B"H
/**
 * @file EditorDOM.js
 * @brief THE SEARCH FOR THE PLACE (Bakashat HaMakom).
 * 
 * CHAPTER 8: FINDING THE TABERNACLE
 * A soul needs a body. The Editor needs a container. 
 * This utility locates the physical domain where the editor shall manifest.
 * 
 * THE POEM OF THE CONTAINER:
 * We search through the tree, we search through the root,
 * To find the right div, and to find the right fruit!
 * If the element's there, the editor stays,
 * Manifesting the traits in a thousand ways.
 */

export class EditorDOM {
    /**
     * @function getContainer
     * @description Locates the designated mount point for the editor UI.
     * @returns {HTMLElement|null} The target vessel.
     */
    static getContainer() {
        return document.getElementById('editor-container');
    }
}
