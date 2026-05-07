
/**
 * B"H
 * @chapter The Speech of the Creator (Malchus)
 * @description
 * In the beginning, there was Thought. But Thought alone does not a physical 
 * UI make. We must use Speech (Malchus) to articulate the Infinite Will into 
 * finite divs and canvases.
 * 
 * This generator is the weaver of vessels. It recursively traverses the 
 * "Blueprints" of our reality, manifesting every attribute, every style, 
 * and every child node into the visible world of Asiyah.
 */
export class HtmlGenerator {
    /**
     * @description Materializes a JSON Blueprint into a living HTMLElement.
     * @param {Object} blueprint - The spiritual DNA of the element.
     * @param {string} blueprint.tag - The HTML tag name.
     * @param {Object} [blueprint.style] - CSS properties.
     * @param {Object} [blueprint.attrs] - Attributes like 'id' or 'class'.
     * @param {string} [blueprint.text] - Inner text content.
     * @param {Array<Object>} [blueprint.children] - Offspring nodes.
     * @returns {HTMLElement} The physically manifest node.
     */
    static utter(blueprint) {
        if (!blueprint || !blueprint.tag) return null;

        // Creating the vessel from the void
        const vessel = document.createElement(blueprint.tag);

        // Imbuing the characteristics
        if (blueprint.style) {
            Object.assign(vessel.style, blueprint.style);
        }

        if (blueprint.attrs) {
            Object.entries(blueprint.attrs).forEach(([key, val]) => {
                if (key === 'class') vessel.className = val;
                else vessel.setAttribute(key, val);
            });
        }

        if (blueprint.id) vessel.id = blueprint.id;
        if (blueprint.text) vessel.innerText = blueprint.text;

        // Recursive generations
        if (blueprint.children && Array.isArray(blueprint.children)) {
            blueprint.children.forEach(seed => {
                const child = this.utter(seed);
                if (child) vessel.appendChild(child);
            });
        }

        return vessel;
    }
}
