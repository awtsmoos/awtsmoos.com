
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
     * Now upgraded to recursively handle nested vessels, allowing for
     * keyframes, media queries, and other complex spiritual forms.
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
        
        let cssString = this.generateCSS(StyleSefirot);

        styleElement.textContent = cssString;
        document.head.appendChild(styleElement);
    }

    /**
     * @function generateCSS
     * @description
     * B"H
     * A recursive weaver of styles, converting JS objects into pure CSS.
     * 
     * @param {Object} obj - The style object to convert.
     * @param {number} [indent=0] - The current indentation level.
     * @returns {string} The generated CSS string.
     */
    static generateCSS(obj, indent = 0) {
        let css = "";
        const space = "  ".repeat(indent);

        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null) {
                css += `${space}${key} {\n`;
                css += this.generateCSS(value, indent + 1);
                css += `${space}}\n\n`;
            } else {
                // Convert camelCase to kebab-case for CSS properties
                const property = key.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
                css += `${space}${property}: ${value};\n`;
            }
        }
        return css;
    }
}
