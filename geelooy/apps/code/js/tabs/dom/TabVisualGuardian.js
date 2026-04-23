
// B"H
/**
 * @file TabVisualGuardian.js
 * @brief THE ZEALOT OF FOCUS.
 * 
 * THE PSALM OF SINGULARITY:
 * When the mind wanders, the vision blurs. The "Two Active Tabs" bug was a lack of 
 * absolute discipline in the DOM. This module acts as a divine guard, ruthlessly 
 * purging all active highlights before allowing a singular chosen tab to glow.
 */

import { State } from '../../state.js';

export const TabVisualGuardian = {
    /**
     * @function enforceSingularFocus
     * @description Synchronously obliterates all 'active' highlights in the tab bar.
     */
    enforceSingularFocus(targetId) {
        const numId = Number(targetId);
        
        // 1. Gevurah: The Strict Purge.
        const allTabs = document.querySelectorAll('.tab');
        allTabs.forEach(tab => {
            tab.classList.remove('active');
        });

        // 2. Chesed: The Illuminating Grace.
        const targetEl = document.querySelector(`.tab[data-tab-id="${numId}"]`);
        if (targetEl) {
            targetEl.classList.add('active');
            
            // Ensure the tab is perceived by the user's eye.
            requestAnimationFrame(() => {
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            });
        }
        
        State.activeTabId = numId;
        console.log(`[Guardian] B"H - Visual focus locked to Tab: ${numId}`);
    }
};
