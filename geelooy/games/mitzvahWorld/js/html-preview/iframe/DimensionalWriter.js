
// B"H
/**
 * @file DimensionalWriter.js
 * @brief The Scribe of the Sandbox.
 * 
 * CHAPTER IV: THE FINAL DEED
 * This module performs the physical write. It opens the gateway to the 
 * document, pours the assembled light (HTML) inside, and seals it,
 * allowing the scripts within to begin their existence.
 */

export const DimensionalWriter = {
    /**
     * B"H
     * Inscribes the finalized HTML into the physical iframe document.
     */
    write(iframe, htmlEssence) {
        const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (!frameDoc) throw new Error('Physical document target missing from iframe.');

        frameDoc.open();
        frameDoc.write(htmlEssence);
        frameDoc.close();
    }
};
