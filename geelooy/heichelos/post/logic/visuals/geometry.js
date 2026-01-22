//B"H
/**
 * @file geometry.js
 * @description 
 * B"H - The Divine Calculus of Proximity. 
 * This module acts as the Sefirah of Tiferet (Harmony), measuring the balance between 
 * the Infinite Viewport and the finite vessels of text. It calculates the physical 
 * distance from the heart of the seeker's screen to the center of each Revelation, 
 * weighting sub-sections with gravitational importance so that the specific 
 * insight (the Paragraph) outshines its encompassing Verse.
 */

/**
 * findCenterMostElement
 * @description 
 * Navigates the sea of visible nodes to find the one closest to the viewport's center.
 * Like a magnet seeking the center of the Earth, this function identifies the true focus.
 * @param {Set|Array} nodes - The current assembly of visible vessels (DOM elements).
 * @returns {HTMLElement|null} - The element that is the heart of the current view.
 */
export function findCenterMostElement(nodes) {
    if (!nodes || (nodes.size === 0 && nodes.length === 0)) return null;

    const viewportCenter = window.innerHeight / 2;
    console.log(`B"H - [Geometry] Viewport Center: ${viewportCenter}px. Evaluating ${nodes.size || nodes.length} nodes.`);
    
    let closest = null;
    let minDistance = Infinity;

    // Convert potential Set to Array for the journey through the nodes
    const candidates = Array.from(nodes);

    candidates.forEach(el => {
        const rect = el.getBoundingClientRect();
        
        // The center-point of the vessel in physical space
        const elCenter = rect.top + (rect.height / 2);
        const distance = Math.abs(viewportCenter - elCenter);

        /**
         * B"H - SPECIFICITY GRAVITY
         * We give Sub-Sections (.sub-awtsmoos) a divine advantage.
         * If a Paragraph is near the center, it should 'win' over its parent Verse,
         * even if the Verse's mathematical center is slightly closer.
         */
        const isSub = el.classList.contains('sub-awtsmoos');
        const weightedDistance = isSub ? distance - 100 : distance;

        if (weightedDistance < minDistance) {
            minDistance = weightedDistance;
            closest = el;
        }
    });

    if (closest) {
        // Log the winner to confirm the light is finding its mark
        // console.log(`B"H - [Geometry] Winner: ${closest.className} ID: ${closest.dataset.idx}`);
    }
    
    return closest;
}

/**
 * isElementInFocusZone
 * @description
 * Determines if a vessel is within the 'Golden Ring'—the center 20% of the screen.
 * @param {HTMLElement} el - The vessel to test.
 * @returns {boolean} - True if the light is centered.
 */
export function isElementInFocusZone(el) {
    const rect = el.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const zoneTop = viewportHeight * 0.4;
    const zoneBottom = viewportHeight * 0.6;
    
    const elCenter = rect.top + (rect.height / 2);
    return elCenter >= zoneTop && elCenter <= zoneBottom;
}