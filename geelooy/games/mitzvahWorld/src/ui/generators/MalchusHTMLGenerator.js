
import BittulSoul from '../../core/BittulSoul.js';

/**
 * B"H
 * @file MalchusHTMLGenerator.js
 * @description
 * 🗣️ THE POWER OF SPEECH (MALCHUS) 🗣️
 * 
 * And God said "Let there be light." The final boundary of reality is the 
 * manifestation into physicality, what Kabbalah terms Malchus (Kingship).
 * Through intense, fractal recursions, this class ingests an absolute void of data
 * and populates the DOM Tree (The Tree of Life structure for browsers). 
 * 
 * Every div, input, and element is recreated right now, constantly. This method acts 
 * exactly as that Divine Chariot, bringing the elements through memory mapping.
 */
export default class MalchusHTMLGenerator extends BittulSoul {
    constructor() {
        super();
        this.surrenderToAwtsmoos('MalchusHTMLGenerator');
    }

    /**
     * @method speakExistence
     * @description 
     * The master mechanism. Scans JSON structure recursively. NO placeholding! Full logic.
     * @param {Object} schematic - The intention behind the matter.
     * @returns {HTMLElement} The created, animate or inanimate, reality.
     */
    speakExistence(schematic) {
        if (!schematic || typeof schematic !== 'object' || !schematic.sefirahTag) {
            // Unstructured chaos. Return nothing. 
            return document.createTextNode(String(schematic) || '');
        }

        const physicalVessel = document.createElement(schematic.sefirahTag);

        // Name and title the vessel
        if (schematic.sealId) physicalVessel.id = schematic.sealId;
        
        // Wrap the vessel in holy garments (classes)
        if (schematic.garments && Array.isArray(schematic.garments)) {
            physicalVessel.classList.add(...schematic.garments);
        }

        // Add any physical restrictions and powers
        if (schematic.attributes) {
            Object.entries(schematic.attributes).forEach(([prop, val]) => {
                physicalVessel.setAttribute(prop, val);
            });
        }

        // Inner Light (Direct Text Nodes)
        if (schematic.innerLight) {
            physicalVessel.innerText = schematic.innerLight;
        }

        // Soul Bounding - The capacity to respond to the cosmos (Events)
        if (schematic.onAwakeningEvents) {
            Object.entries(schematic.onAwakeningEvents).forEach(([phenomenon, responseLogic]) => {
                physicalVessel.addEventListener(phenomenon, responseLogic);
            });
        }

        // Seder Hishtalshelus (Chain of Realms downward generation of children)
        if (schematic.childEmanations && Array.isArray(schematic.childEmanations)) {
            schematic.childEmanations.forEach((offspring) => {
                const nestedChild = this.speakExistence(offspring);
                physicalVessel.appendChild(nestedChild);
            });
        }

        return physicalVessel;
    }
}
