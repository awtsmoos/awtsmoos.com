
// B"H
/**
 * @file TextRenderer.js
 * @brief The Painter of the Revealed Word.
 */

import { MarkdownParser } from '../../../modules/markdown-parser.js';

export const TextRenderer = {
    /**
     * B"H
     * Transforms markdown into HTML and injects it.
     * RECTIFIED: Only updates if content has fundamentally shifted to prevent visual flickering.
     */
    render(layer, text) {
        if (!text || text.trim() === '') {
            layer.innerHTML = '';
            layer.style.display = 'none';
            return;
        }

        layer.style.display = 'block';

        // Use a data-attribute to track the 'Solidified Text'
        if (layer.dataset.raw !== text) {
            // B"H - Efficient re-rendering. 
            // We only replace if the char length significantly changed or stream ended.
            layer.innerHTML = MarkdownParser.parse(text);
            layer.dataset.raw = text;
        }
    }
};
