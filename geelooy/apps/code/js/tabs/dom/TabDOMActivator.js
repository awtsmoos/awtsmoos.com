
// B"H
/**
 * @file TabDOMActivator.js
 * @brief The Angel of Chesed (Illumination).
 */
import { State } from '../../state.js';

export const TabDOMActivator = {
    illuminate(targetId) {
        const numId = Number(targetId);
        State.activeTabId = numId;

        const targetEl = document.querySelector(`.tab[data-tab-id="${numId}"]`);
        if (targetEl) {
            targetEl.classList.add('active');
            
            // Wait for any potential layout reflows, then softly scroll the tab into optimal sight
            requestAnimationFrame(() => {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            });
        }
    }
};
