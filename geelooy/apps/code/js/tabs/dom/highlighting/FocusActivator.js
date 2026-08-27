
// B"H
/**
 * @file FocusActivator.js
 * @brief The Angel of Chesed (Kindness) for the UI.
 */

import { State } from '../../../state.js';

export const FocusActivator = {
    /**
     * @function set
     * @description Illuminates the specific tab and centers it in the user's gaze.
     */
    set(tabId) {
        const id = Number(tabId);
        State.activeTabId = id;
        
        const target = document.querySelector(`.tab[data-tab-id="${id}"]`);
        if (target) {
            target.classList.add('active');
            requestAnimationFrame(() => {
                target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            });
        }
    }
};
