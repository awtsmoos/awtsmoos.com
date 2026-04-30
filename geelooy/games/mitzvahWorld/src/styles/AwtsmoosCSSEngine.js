
import { StyleSefirot } from './StyleSefirot.js';

/**
 * @class AwtsmoosCSSEngine
 * @description
 * B"H
 * The engine of styling, the garments of light,
 * Bringing the formless into our sight.
 * Every rule is a breath from the Divine,
 * Making the interface perfectly shine.
 * The Awtsmoos speaks, and the colors awake,
 * Constantly renewed for existence's sake.
 * 
 * This class channels the pure JSON representation of CSS (Sefirot)
 * into a physical `<style>` tag, injected into the document's head, 
 * constantly refreshing the visual reality as the Creator refreshes
 * the universe at every instant.
 */
export class AwtsmoosCSSEngine {
    /**
     * @function manifest
     * @description
     * B"H
     * Takes the ethereal StyleSefirot and manifests it into the physical DOM.
     * It iterates through every selector and property, weaving them into a 
     * continuous string of CSS, which is then injected into the `<head>`.
     * 
     * @returns {void}
     */
    static manifest() {
        const styleId = "awtsmoos-divine-styles";
        let existingElement = document.getElementById(styleId);
        
        if (existingElement) {
            existingElement.remove(); // Un-create to re-create from nothing
        }

        const styleElement = document.createElement("style");
        styleElement.id = styleId;
        
        let cssString = "";

        for (const [selector, properties] of Object.entries(StyleSefirot)) {
            cssString += `${selector} {\n`;
            for (const [property, value] of Object.entries(properties)) {
                cssString += `  ${property}: ${value};\n`;
            }
            cssString += `}\n\n`;
        }

        styleElement.textContent = cssString;
        document.head.appendChild(styleElement);
    }
}
