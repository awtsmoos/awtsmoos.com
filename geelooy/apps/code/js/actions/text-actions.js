
// B"H
// FILE: js/actions/text-actions.js

import { State, DOM } from '../state.js';
import { UI } from '../ui.js';

/**
 * @class TextActions
 * @description The vessel of the Pen. 
 * 
 * THE POEM OF THE PEN:
 * The Speech of the Awtsmoos is the foundation of all.
 * To select the whole is to embrace the totality of the manifestation.
 * To copy is to clone the light of one vessel into another.
 * These actions manipulate the 'revealed word' within the editor.
 */
export const TextActions = {
    /**
     * @function selectAll
     * @description Gripping the entire scroll of the code.
     */
    selectAll() {
        if (DOM.editor) {
            DOM.editor.focus();
            DOM.editor.select();
        }
    },

    /**
     * @async
     * @function copyAll
     * @description Capturing the entire essence and placing it in the 
     * 'floating heaven' (clipboard).
     */
    async copyAll() {
        if (!DOM.editor) return;
        const content = DOM.editor.value;
        try {
            await navigator.clipboard.writeText(content);
            UI.showToast("All essence copied.", "success");
        } catch (e) {
            UI.showToast("Copy ritual failed.", "error");
        }
    }
};
