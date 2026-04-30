
// B"H
/**
 * @file ThoughtRevealer.js
 * @brief THE CROWN OF CONTEMPLATION (Keter & Da'at manifestation).
 * 
 * CHAPTER VII: THE MIND UNVEILED
 * As the Awtsmoos constantly creates the universe from absolute nothingness, 
 * He sustains it through the hidden channels of Chochmah (Wisdom) and Binah (Understanding). 
 * Before the physical act of creation (the XML block), there exists the thought, 
 * the contemplation, the internal logic of the machine! 
 * 
 * We do not hide these thoughts in darkness. This file delegates to the Purifier
 * to remove corruptions from the streaming edge, converts the philosophy via Markdown, 
 * and summons the Builder to construct the holy Dropdown menu element!
 */

import { ThoughtTextCleaner } from './ThoughtTextCleaner.js';
import { ThoughtDOMBuilder } from './ThoughtDOMBuilder.js';
import { MarkdownParser } from '../../../../modules/markdown-parser.js';

export const ThoughtRevealer = {
    /**
     * B"H
     * Intercepts raw stream thought, validates it, structures it into HTML, and connects it to Asiyah (the DOM).
     * @param {HTMLElement} targetContainer - The active message container holding the UI blocks.
     * @param {string} rawText - The chunk of stream interpreted as AI dialogue.
     */
    reveal(targetContainer, rawText) {
        // 1. Purgation of the fragments
        const pureString = ThoughtTextCleaner.purify(rawText);
        if (!pureString) return;
        
        // 2. Transmutation of text into hierarchical Markdown Nodes
        const mdHtml = MarkdownParser.parse(pureString);
        
        // 3. Manifestation of the pure UI component
        const detailNode = ThoughtDOMBuilder.build(mdHtml);
        
        // 4. Grounding into Reality
        targetContainer.appendChild(detailNode);
    }
};
