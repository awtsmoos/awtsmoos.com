
/**
 * B"H
 * @module Dimensionality
 * @chapter The Proportions of the Vessel
 * @description
 * A word too small cannot be read; a word too large shatters 
 * the scroll. This module regulates the dimensions—the Font Size—
 * of the manifest Revelation. It draws upon the user's past choices 
 * from the 'Reshimu' (LocalStorage) to ensure a comfortable gaze 
 * upon the Infinite Text.
 */

/**
 * @function adjustFontSize
 * @description
 * Changes the physical scale of all manifest letters by 
 * modifying the root context variables.
 * 
 * @param {string} action - Either 'increase' or 'decrease'.
 */
export function adjustFontSize(action) {
    const context = document.querySelector('.post-reader-localized-context');
    if (!context) return;

    let currentStr = context.style.getPropertyValue('--post-text-size') || 
                     window.getComputedStyle(context).getPropertyValue('--post-text-size') || 
                     '28px';
                     
    let current = parseFloat(currentStr);
    
    const MAX_FONT_SIZE = 120; 
    const MIN_FONT_SIZE = 16;
    const FONT_SIZE_INCREMENT = 4; 

    if (action === 'increase' && current < MAX_FONT_SIZE) {
        current += FONT_SIZE_INCREMENT;
    } else if (action === 'decrease' && current > MIN_FONT_SIZE) {
        current -= FONT_SIZE_INCREMENT;
    }
    
    context.style.setProperty('--post-text-size', current + 'px');
    localStorage.currentPostFontSize = current + 'px';
}

/**
 * @function loadFontSize
 * @description
 * Recalls the seeker's preferred scale from the memory of the 
 * browser and applies it to the world.
 */
export function loadFontSize() {
    let fs = localStorage.currentPostFontSize;
    const context = document.querySelector('.post-reader-localized-context');
    if (!context) return;

    if (fs) {
        let val = parseFloat(fs);
        if (val > 150 || val < 10) {
            fs = '28px';
            localStorage.currentPostFontSize = fs;
        }
        context.style.setProperty('--post-text-size', fs);
    } else {
        context.style.setProperty('--post-text-size', '28px'); 
    }
}
