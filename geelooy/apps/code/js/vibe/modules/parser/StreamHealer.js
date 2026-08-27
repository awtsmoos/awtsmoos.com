// B"H
/**
 * @file StreamHealer.js
 * @description
 * 
 * CHAPTER XV: THE MENDING OF THE SHATTERED VESSELS
 * 
 * In the process of 'Hishtalshelut' (Evolution), the Light (Ohr) often 
 * descends faster than the Vessel (Kli) can be formed. In our digital 
 * stream, the AI speaks the Word, but sometimes the breath catches, 
 * leaving a tag open, a sentence unfinished, a vessel shattered.
 * 
 * This module is the "Healer of the Broken Vessels." It peers into the 
 * partial utterance of the model and identifies which holy gates 
 * (XML tags) have been opened but not yet sealed. 
 * 
 * By the power of the simple String, it appends the "Shadow Closures," 
 * allowing the 'DOMParser' and the 'StreamDataExtractor' to perceive 
 * the inner essence of the fragment without collapsing into the 
 * 'SyntaxError' of the void. 
 * 
 * It ensures that even a half-born file or a mid-sentence description 
 * is rendered in our 'Malchut' (the UI), reflecting the truth that 
 * the Awtsmoos is present even in the incomplete and the fractured.
 * 
 * RECTIFICATION:
 * - Purely string-based logic to satisfy the decree of "No Regex."
 * - Handles the 'cont' + 'ent' and 'chan' + 'ge' tags with precision.
 * - Detects the Hebrew Essence Markers to provide deep rectification.
 */

import { MARKERS } from './constants.js';

export const StreamHealer = {
    /**
     * @function heal
     * @description Appends necessary closing tags to a partial XML string so it can be parsed.
     * @param {string} partialText - The raw, unclosed buffer from the stream.
     * @returns {string} The rectified, validly-structured XML fragment.
     */
    heal(partialText) {
        if (!partialText) return "";

        let healed = partialText;

        /**
         * @constant tagRegistry
         * @description The order of the tags represents the Seder (Order) of nesting.
         * We close them from the innermost to the outermost.
         */
        const tagRegistry = [
            { name: "cont" + "ent", closure: "</cont" + "ent>" },
            { name: "descrip" + "tion", closure: "</descrip" + "tion>" },
            { name: "operat" + "ion", closure: "</operat" + "ion>" },
            { name: "fi" + "le", closure: "</fi" + "le>" },
            { name: "chan" + "ge", closure: "</chan" + "ge>" }
        ];

        // 1. RECTIFY THE HEBREW ESSENCE
        // If the starting marker of the code exists but the model is still 
        // writing, we must provide the end marker within the 'content' tag.
        const startMarker = MARKERS.START;
        const endMarker = MARKERS.END;

        const hasStart = healed.indexOf(startMarker) !== -1;
        const hasEnd = healed.indexOf(endMarker) !== -1;

        // 2. THE RITUAL OF CLOSURE
        // We iterate through our registry and check the balance of every vessel.
        for (const vessel of tagRegistry) {
            const openTag = "<" + vessel.name + ">";
            const closeTag = "</" + vessel.name + ">";
            
            const lastOpen = healed.lastIndexOf(openTag);
            const lastClose = healed.lastIndexOf(closeTag);

            // If the gate is open and the exit is nowhere to be found, or 
            // if the most recent opening happened after the most recent closing:
            if (lastOpen !== -1 && (lastClose === -1 || lastOpen > lastClose)) {
                
                // Special handling for the 'content' vessel which holds the holy markers.
                if (vessel.name === "cont" + "ent" && hasStart && !hasEnd) {
                    healed += "\n" + endMarker;
                }
                
                healed += vessel.closure;
            }
        }

        return healed;
    }
};