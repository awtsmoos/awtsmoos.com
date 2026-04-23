
// B"H
/**
 * @file CompactLayoutEngine.js
 * @brief THE GEOMETER OF THE VIBE.
 */

export const CompactLayoutEngine = {
    /**
     * @function shrink
     * @description Forces a card into a tight, padding-free state.
     */
    shrink(element) {
        if (!element) return;
        element.style.padding = '8px 12px';
        element.style.margin = '0 0 6px 0';
        element.style.minHeight = '0';
        
        const contents = element.querySelectorAll('.vibe-model-text, .vibe-card-desc');
        contents.forEach(c => {
            c.style.margin = '0';
            c.style.padding = '0';
            c.style.lineHeight = '1.3';
        });
    }
};
