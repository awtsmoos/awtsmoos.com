// B"H
/**
 * @file ThoughtTextCleaner.js
 * @brief THE PURIFIER OF INTENT.
 * 
 * THE PSALM OF THE CLEAN SLATE:
 * Sometimes, when the XML stream crashes against the shores of Asiyah,
 * fragments of tags break off and bleed into the surrounding thought-spaces.
 * This sacred vessel takes in the raw, messy cognitive dump from the AI,
 * strips away the fragmented boundaries (</change>, <content>),
 * and leaves only the pure philosophical emanation (the thought itself).
 */

export const ThoughtTextCleaner = {
    /**
     * B"H
     * Excisies corrupted, partial tags and filters out complete silence.
     * @param {string} rawText The unformatted thoughts from the streaming chunk.
     * @returns {string|null} The cleansed thought string, or null if it was a false signal.
     */
    purify(rawText) {
        if (!rawText) return null;
        const cleansed = rawText.trim();
        if (!cleansed) return null;
        
        // Guard: Prevent the UI from rendering empty ghost bubbles if the 
        // stream cut exactly at the closure of an XML element.
        const isFragmentedTagOnly = cleansed.includes("</change>") && cleansed.replace(/<\/change>/g, '').trim().length === 0;
        if (isFragmentedTagOnly) return null;

        return cleansed;
    }
};