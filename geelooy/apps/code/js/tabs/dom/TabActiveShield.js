
// B"H
/**
 * @file TabActiveShield.js
 * @brief THE GUARDIAN OF THE SINGULAR FOCUS.
 * 
 * THE PSALM OF THE ONE:
 * Two lights cannot occupy the same space without confusion. 
 * This shield ensures that when a new tab is chosen, all previous
 * highlights are utterly dissolved before the new one is revealed.
 * It prevents the multi-select illusion on Vibe tabs.
 */

import { State } from '../../state.js';

export const TabActiveShield = {
    /**
     * @function applySingularActiveState
     * @description Synchronously enforces that only ONE tab has the active class.
     * @param {number} activeId - The ID of the chosen vessel.
     */
    applySingularActiveState(activeId) {
        const targetNum = Number(activeId);
        State.activeTabId = targetNum;

        // 1. PURGE: Remove active garment from all physical tab elements
        const currentActiveEls = document.querySelectorAll('.tab.active');
        currentActiveEls.forEach(el => {
            el.classList.remove('active');
        });

        // 2. MANIFEST: Apply only to the correct vessel
        const targetEl = document.querySelector(`.tab[data-tab-id="${targetNum}"]`);
        if (targetEl) {
            targetEl.classList.add('active');
            
            // Ensure visibility for the user
            requestAnimationFrame(() => {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            });
        }
        
        console.log(`[TabActiveShield] B"H - Visual focus locked to ${targetNum}`);
    }
};
