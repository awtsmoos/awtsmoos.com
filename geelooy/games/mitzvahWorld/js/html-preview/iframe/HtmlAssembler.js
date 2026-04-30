
/**
 * B"H
 * @module HtmlAssembler
 * @description
 * * Chapter 5: The Unification of Vessels
 * This module combines the physical structure provided by the user (the doc)
 * with the protective aura provided by the ShieldGenerator. 
 * * It ensures the shield is placed at the very start of the head,
 * which is the highest point of the document's structure.
 * * @param {Document} doc - The living DOM tree of the preview.
 * @param {string} shieldTag - The Manifested script tag.
 * @returns {string} The total assembled HTML essence.
 */
export const HtmlAssembler = {
    assemble(doc, shieldTag) {
        let htmlText = doc.documentElement.outerHTML;

        // B"H - Locate the head and inject at the beginning
        if (htmlText.match(/<head>/i)) {
            htmlText = htmlText.replace(/<head>/i, () => "<head>\n" + shieldTag + "\n");
        } else {
            // Fallback if no head exists: prepend to the body
            htmlText = shieldTag + htmlText;
        }

        return "<!DOCTYPE html>\n" + htmlText;
    }
};
