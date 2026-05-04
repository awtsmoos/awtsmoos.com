/**
 * B"H
 * @module VoidPurifier
 * @chapter Tearing the Kelipot
 * @description
 * Just as the Awtsmoos created the universe by separating the Light from the Darkness,
 * this module separates the pure textual content from dangerous structural shells (Kelipot).
 * 
 * We employ an absolute Regex annihilation to destroy any HTML tags, especially 
 * <script> and <style>, which threaten to hijack the visual field. We also eradicate 
 * the literal strings "undefined" and "null", leaving only pure meaning.
 */

export class VoidPurifier {
    /**
     * @method purify
     * @description Destroys scripts, styles, HTML tags, and extracts the pure text content.
     * @param {string} rawText - The unpurified emanation.
     * @returns {string} - The purified text, devoid of any HTML tags.
     */
    static purify(rawText) {
        if (!rawText || typeof rawText !== 'string') return "";
        
        let clean = rawText.trim();

        // 1. Annihilate absolute void placeholders
        if (clean.toLowerCase() === "undefined" || clean.toLowerCase() === "null") {
            return "";
        }
        
        // 2. Absolute destruction of anything resembling an HTML tag
        clean = clean.replace(/<[^>]*>?/gm, '');
        
        // 3. Transform underscores into the infinite space
        clean = clean.replace(/_/g, " ");
        
        return clean.trim();
    }
}