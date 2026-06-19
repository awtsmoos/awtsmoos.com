
// B"H
/**
 * @file EditorTabsArea.js
 * @brief THE NAVIGATION OF WORLDS (Netivut HaAtzilut).
 * 
 * CHAPTER 4: THE ROW OF POSSIBILITIES
 * Before the attributes can be chosen, the realm must be entered. 
 * This area generates the navigation buttons that allow the soul 
 * to traverse the different customization strata.
 * 
 * THE POEM OF THE TABS:
 * A button for the skin, a button for the coat,
 * A choice for the boat that the spirit must float!
 * We click and we shift through the layers of being,
 * To adjust all the details that the viewer is seeing.
 */

import { EditorRender } from '../core/render.js';

export class EditorTabsArea {
    /**
     * @function render
     * @description Constructs the HTML string for the tab navigation row.
     * @param {EditorManager} editor - The manager containing the state and data.
     * @returns {string} The physical HTML manifestation.
     */
    static render(editor) {
        return `
            <nav class="editor-tabs" role="tablist">
                ${EditorRender.tabs(editor)}
            </nav>
        `;
    }
}
