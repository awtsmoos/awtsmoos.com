
// B"H
/**
 * @file ManifestCardStyleForge.js
 * @brief THE ARCHITECT OF THE COMPACT VESSEL.
 */

export const ManifestCardStyleForge = {
    /**
     * @function apply
     * @description Forces a tight, professional visual manifestation upon a card.
     */
    apply(card, isComplete) {
        const s = card.style;
        
        // Root Container Stricture
        s.padding = '8px 12px';
        s.margin = '0 0 6px 0';
        s.display = 'flex';
        s.flexDirection = 'column';
        s.gap = isComplete ? '2px' : '8px';
        s.minHeight = 'auto';
        s.height = 'auto';
        s.overflow = 'hidden';

        // Internal Text Stricture
        const descendants = card.querySelectorAll('.vibe-model-text, .vibe-card-desc');
        descendants.forEach(d => {
            d.style.margin = '0';
            d.style.padding = '0';
            d.style.lineHeight = '1.3';
        });
    }
};
