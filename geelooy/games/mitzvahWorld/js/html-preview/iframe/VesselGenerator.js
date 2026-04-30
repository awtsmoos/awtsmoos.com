
// B"H
/**
 * @file VesselGenerator.js
 * @brief The Geometric Forge for the Preview Document.
 * 
 * CHAPTER I: THE ASSEMBLY OF FORM
 * This module takes the abstract structure of the user's project and 
 * wraps it in a protective aura. It injects the holy interceptor scripts 
 * at the very beginning of the head, ensuring they are the first to 
 * receive the breath of life (execution).
 */

export const VesselGenerator = {
    /**
     * B"H
     * Constructs the total HTML string for the iframe.
     */
    generate(doc, shieldScript) {
        const shield = `<script data-merkava-internal="true">${shieldScript}</script>`;
        let htmlText = doc.documentElement.outerHTML;

        // B"H - The Crown Inversion (Head Injection)
        if (htmlText.match(/<head>/i)) {
            htmlText = htmlText.replace(/<head>/i, () => `<head>\n${shield}\n`);
        } else {
            // If the user forgot the head, we manifest it for them.
            htmlText = shield + htmlText;
        }

        return "<!DOCTYPE html>\n" + htmlText;
    }
};
