
/**
 * B"H
 * "Forever, Lord, Your Word stands in the heavens" (Psalms 119:89).
 * Every physical item is sustained dynamically via the words spoken.
 * This class interprets divine Blueprints (JSON Objects) and solidifies 
 * them directly into the Physical World (DOM Elements) recursively.
 */
export class DivineSpeechGenerator {
    
    /**
     * Converts a raw data concept into physical HTML.
     * Purely data-driven structure handling attributes, styles, arrays of children.
     * @param {Object} blueprint - The spiritual mapping definition.
     * @returns {HTMLElement} The physically materialized node.
     */
    static pronounceForm(blueprint) {
        if (!blueprint || !blueprint.t) return null;
        
        const vessel = document.createElement(blueprint.t);
        
        // Imbue structural garments (attributes & styles)
        if (blueprint.a) {
            Object.keys(blueprint.a).forEach(propKey => {
                const propVal = blueprint.a[propKey];
                if (propKey === 'class') {
                    vessel.className = propVal;
                } else if (propKey === 'style') {
                    Object.assign(vessel.style, propVal);
                } else if (propKey === 'text') {
                    vessel.innerText = propVal;
                } else {
                    vessel.setAttribute(propKey, propVal);
                }
            });
        }
        
        // Bring forth generations recursively without limit
        if (blueprint.c && Array.isArray(blueprint.c)) {
            blueprint.c.forEach(childSeed => {
                const childElement = DivineSpeechGenerator.pronounceForm(childSeed);
                if (childElement) vessel.appendChild(childElement);
            });
        }
        
        return vessel;
    }
}
