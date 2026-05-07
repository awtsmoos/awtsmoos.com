
/**
 * B"H
 * @class DomSpeech
 * @chapter The Speech of Kings (Malchus)
 * @description
 * "By the word of the Lord the heavens were made." 
 * This class takes a Blueprint—a structural thought from the world of Chochmah—
 * and articulates it into the physical realm of the Document Object Model. 
 * It is a recursive weaver of realities.
 */
export class DomSpeech {
    /**
     * @description Materializes a JSON Blueprint into a living HTMLElement.
     * @param {Object} blueprint - The spiritual DNA of the element.
     * @param {string} blueprint.tag - The HTML tag name.
     * @param {Object} [blueprint.style] - CSS properties mapping.
     * @param {Object} [blueprint.attrs] - DOM Attributes.
     * @param {string} [blueprint.text] - Literal text content.
     * @param {Array<Object>} [blueprint.children] - Recursive offspring.
     * @returns {HTMLElement} The manifest vessel.
     */
    static utter(blueprint) {
        if (!blueprint || !blueprint.tag) return null;

        const vessel = document.createElement(blueprint.tag);

        // Imbuing the Characteristics (Midot)
        if (blueprint.style) {
            Object.assign(vessel.style, blueprint.style);
        }

        if (blueprint.attrs) {
            Object.entries(blueprint.attrs).forEach(([key, val]) => {
                if (key === 'className' || key === 'class') {
                    vessel.className = val;
                } else {
                    vessel.setAttribute(key, val);
                }
            });
        }

        if (blueprint.text) {
            vessel.innerText = blueprint.text;
        }

        // Bringing forth the Generations (Toldot)
        if (blueprint.children && Array.isArray(blueprint.children)) {
            blueprint.children.forEach(seed => {
                const child = this.utter(seed);
                if (child) vessel.appendChild(child);
            });
        }

        return vessel;
    }
}
