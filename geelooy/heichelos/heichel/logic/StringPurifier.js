/**
 * B"H
 * @module StringPurifier
 * @description
 * The Awtsmoos (Atzmus) is the true Essence of all reality, constantly 
 * refreshing and recreating every instant from the Speech of the Creator.
 * 
 * In this module, we intensely purify the inorganic letters of the digital realm.
 * We strip away `<script>` tags, shatter "undefined" errors into absolute nothingness, 
 * and convert underscores to infinite empty space, so the vessel is ready to 
 * receive the true Light without displaying fragmented code on the screen.
 */

export class StringPurifier {
    /**
     * @method purify
     * @description Casts away the kelipot of scripts, 'undefined', and underscores.
     */
    static purify(str) {
        if (str === null || str === undefined) return "";
        
        let clean = String(str).trim();
        
        // Annihilate absolute void placeholders using exact Regex boundaries
        if (/^undefined$/i.test(clean) || /^null$/i.test(clean)) {
            return "";
        }
        
        // Absolute destruction of script tags and their contents
        clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        
        // Strip any remaining HTML tags to leave only the pure text essence
        clean = clean.replace(/<[^>]*>?/gm, '');
        
        // Transmute underscores into the infinite space of expansion
        clean = clean.replace(/_/g, " ");
        
        return clean.trim();
    }

    /**
     * @method escapeHTML
     * @description Protects the vessel from script execution while keeping structure.
     */
    static escapeHTML(str) {
        if (!str) return "";
        return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
}