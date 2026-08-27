// B"H
/**
 * @file VisualFocusEnforcer.js
 * @brief THE ZEALOT OF PERCEPTION.
 * 
 * THE PSALM OF THE SINGULAR FOCUS:
 * The bug where multiple tabs appear selected is a failure of Gevurah.
 * This module synchronously destroys every '.active' class in the DOM
 * before granting the chosen vessel its aura.
 */

import { State } from '../../state.js';

export const VisualFocusEnforcer = {
    /**
     * @function enforce
     * @description Absolute UI rectification. 
     */
    enforce(targetId) {
        const numId = Number(targetId);
        State.activeTabId = numId;

        // 1. THE GREAT PURGE (Synchronous)
        // This obliterates any lingering 'active' classes from previous tabs.
        const allActive = document.querySelectorAll('.tab.active');
        allActive.forEach(el => el.classList.remove('active'));

        // 2. THE SINGULAR LIGHT
        if (numId !== null && !isNaN(numId)) {
            const targetEl = document.querySelector(`.tab[data-tab-id="${numId}"]`);
            if (targetEl) {
                targetEl.classList.add('active');
                
                // Centering the gaze
                requestAnimationFrame(() => {
                    targetEl.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'nearest', 
                        inline: 'center' 
                    });
                });
            }
        }
        
        console.log(`[FocusEnforcer] B"H - Perception anchored to Tab: ${numId}`);
    }
};