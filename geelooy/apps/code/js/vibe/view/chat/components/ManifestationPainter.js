
// B"H
/**
 * @file ManifestationPainter.js
 * @brief THE ARTIST OF COMPACT REALITY.
 */

import { ManifestCardCleaner } from '../../components/ManifestCardCleaner.js';
import { CompactLayoutEngine } from '../../layout/CompactLayoutEngine.js';

export const ManifestationPainter = {
    /**
     * @function paint
     * @description Decorates a manifestation card with absolute visual strictness.
     */
    paint(card, isComplete) {
        // Enforce the modular layout rules
        CompactLayoutEngine.shrink(card);
        
        // Specific cleaning rituals
        ManifestCardCleaner.apply(card, isComplete);
        
        // Final visual adjustments
        card.style.borderLeft = isComplete ? '3px solid var(--neon-lime)' : '3px solid var(--neon-cyan)';
        card.style.backgroundColor = isComplete ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.02)';
    }
};
