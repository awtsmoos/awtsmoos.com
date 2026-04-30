
/**
 * B"H
 * @module RealitySolidifier
 * @description
 * * Chapter 6: The Moment of Solidification
 * This module performs the actual physical deed. It takes the 
 * assembled HTML and writes it into the iframe's document stream. 
 * * This is the final step in the transition from abstract code
 * to a manifested visual reality.
 * * @param {HTMLIFrameElement} iframe - The physical gateway.
 * @param {string} html - The light to be poured inside.
 */
export const RealitySolidifier = {
    solidify(iframe, html) {
        const frameDoc = iframe.contentDocument || iframe.contentWindow.document;
        if (!frameDoc) throw new Error("Physical document target missing.");

        // Open the gates, pour the light, and seal the record.
        frameDoc.open();
        frameDoc.write(html);
        frameDoc.close();
    }
};
