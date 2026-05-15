
// B"H
/**
 * @file coloring.js
 * @brief Paints the inner darkness and the outer lips.
 */

export const MOUTH_COLORING_MODS = [
    { 
        type: 'setFaceColor', 
        params: { 
            query: { tag: 'mouth_inner' }, 
            color: [0.3, 0.05, 0.05, 1.0] 
        } 
    }
];
