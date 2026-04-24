
/**
 * B"H
 * @module UIBuilder
 * @description
 * Generates the physical interface (HTML/CSS) through which the soul (player) 
 * perceives the Olam. Fixes the previous structural collapse (SyntaxError).
 */

export default class UIBuilder {
    /**
     * @async
     * @function build
     * @description Constructs the core Game Menu UI layer.
     * @param {Object} olam - The world instance to dispatch events through.
     * @param {Object} htmlInfo - The UI blueprint.
     * @returns {Promise<Object>} The constructed HTML definition.
     */
    static async build(olam, htmlInfo) {
        if (!htmlInfo) return null;

        console.log("B\"H - ⚡ INTENSE LOG: Constructing UI Layer...");

        const style = {
            tag: "style",
            innerHTML: `
                .ikarGameMenu {
                    overflow: hidden;
                    position: absolute;
                    transform-origin: top left;
                    bottom: 0;
                    right: 0;
                    top: 0;
                    left: 0;
                }
                .gameUi > div {
                    position: absolute;
                }
            `
        };

        // B"H: Pure, clean strings. No corrupted backslashes.
        const par = {
            shaym: "ikarGameMenu",
            parent: "main av",
            children: [
                htmlInfo,
                style
            ],
            className: "ikarGameMenu"
        };

        await olam.ayshPeula("htmlCreate", par);
        console.log("B\"H - ⚡ INTENSE LOG: UI Layer Forged Successfully.");
        
        return par;
    }
}
