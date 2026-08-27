
// B"H
/**
 * @file TabIlluminator.js
 * @brief The Angel of Light for the UI.
 */

import { State } from '../../../state.js';

export const TabIlluminator = {
    /**
     * @function shine
     * @description Applies the active garment to the specific tab and centers it.
     */
    shine(tabId) {
        const id = Number(tabId);
        State.activeTabId = id;

        const el = document.querySelector(`.tab[data-tab-id="${id}"]`);
        if (el) {
            el.classList.add('active');
            requestAnimationFrame(() => {
                el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            });
        }
    }
};
