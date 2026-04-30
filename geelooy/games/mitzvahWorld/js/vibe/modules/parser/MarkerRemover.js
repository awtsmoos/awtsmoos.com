
/**
 * B"H
 * @module MarkerRemover
 * @description
 * * Chapter 7: The Purgation of the Scaffolding
 * The markers are the scaffolding of the revelation, but they are not the 
 * revelation itself. Once the essence has been identified, the scaffolding 
 * must be retracted. This module performs the absolute removal of the 
 * Hebrew Begin and End markers, leaving only the pristine code.
 * * It uses the 'split-join' ritual to purge every instance of the 
 * markers from the string, ensuring that no metadata remains in the 
 * physical vessel of the file.
 * * @param {string} rawContent - The unrefined utterance containing markers.
 * @returns {string} The purified essence of the code.
 */
import { MARKERS } from './constants.js';

export const MarkerRemover = {
    /**
     * B"H
     * Strips all internal markers and metadata from the code content.
     */
    purify(rawContent) {
        if (!rawContent) return "";
        
        let purified = rawContent;

        // B"H - THE RITUAL OF STRIPPING
        // Pure string-based replacement to avoid Regex interpretation errors
        purified = purified.split(MARKERS.START).join("");
        purified = purified.split(MARKERS.END).join("");
        
        // Final trim to ensure no stray void remains at the borders
        return purified.trim();
    }
};
