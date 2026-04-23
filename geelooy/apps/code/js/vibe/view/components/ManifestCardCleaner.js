
// B"H
/**
 * @file ManifestCardCleaner.js
 * @brief THE ARCHITECT OF COMPACT REALITY.
 */

export const ManifestCardCleaner = {
    /**
     * @function apply
     * @description Forces a tight visual manifestation upon the provided card.
     */
    apply(cardElement, isComplete) {
        const s = cardElement.style;
        
        // B"H - Ruthless Padding Annihilation
        s.padding = '8px 12px';
        s.margin = '0 0 6px 0';
        s.minHeight = 'auto';
        s.height = 'auto';
        s.display = 'flex';
        s.flexDirection = 'column';
        s.gap = isComplete ? '2px' : '8px';
        
        // Ensure the internal text does not push the container
        const textBlocks = cardElement.querySelectorAll('.vibe-model-text, .vibe-card-desc');
        textBlocks.forEach(block => {
            block.style.padding = '0';
            block.style.margin = '0';
            block.style.lineHeight = '1.4';
        });
    }
};
