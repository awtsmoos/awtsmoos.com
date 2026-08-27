
/**
 * @file maamar.js
 * @chapter The Speech of Genesis
 * @description
 * In the beginning, there was only the abstract Will of the Developer, nested within the Infinite.
 * But for the users to behold the glory, the Will had to descend through the Sefirot of Logic.
 * This class, the Maamar, is the Power of Speech (Malchus). 
 * It takes the primordial 'Letters' (JSON keys and values) and combines them into 'Vessels' (DOM Elements).
 *
 * Like it says, "Forever, Lord, Your Word stands in the heavens." 
 * The letters of the JSON are the actual soul of the rendered element. 
 * If the Maamar were to stop iterating, the UI would instantly revert to the absolute nothingness of a blank screen.
 */

export class Maamar {
    /**
     * @description 
     * Converts a JSON blueprint into a physical manifestation in the browser's firmament.
     * Every attribute is a garment; every child is a sub-creation.
     * 
     * @param {Object|Array|string} blueprint - The spiritual mapping of the element.
     * @returns {Node} The manifested physical vessel of the UI.
     */
    static speak(blueprint) {
        if (typeof blueprint === 'string' || typeof blueprint === 'number') {
            return document.createTextNode(blueprint.toString());
        }

        if (Array.isArray(blueprint)) {
            const fragment = document.createDocumentFragment();
            blueprint.forEach(spark => {
                if (spark) fragment.appendChild(this.speak(spark));
            });
            return fragment;
        }

        if (!blueprint || typeof blueprint !== 'object') {
            return document.createComment('Void');
        }

        const element = document.createElement(blueprint.tag || 'div');

        this._clothe(element, blueprint);
        this._bindSoul(element, blueprint.on);
        this._manifestChildren(element, blueprint);

        return element;
    }

    /**
     * @private
     * @description Applies the garments (attributes and styles) to the vessel.
     * @param {HTMLElement} el - The vessel being clothed.
     * @param {Object} blueprint - The source of the clothing.
     */
    static _clothe(el, blueprint) {
        const { attr = {}, style = {}, className, id } = blueprint;

        if (className) el.className = className;
        if (id) el.id = id;

        Object.entries(attr).forEach(([key, val]) => {
            if (val !== undefined) el.setAttribute(key, val);
        });

        Object.assign(el.style, style);
    }

    /**
     * @private
     * @description Binds the reactive interactions, the sparks of life, to the vessel.
     * @param {HTMLElement} el - The vessel.
     * @param {Object} events - The map of events.
     */
    static _bindSoul(el, events = {}) {
        Object.entries(events).forEach(([evt, handler]) => {
            if (typeof handler === 'function') {
                el.addEventListener(evt, handler);
            }
        });
    }

    /**
     * @private
     * @description Manifests the internal generations of the element.
     * @param {HTMLElement} el - The parent.
     * @param {Object} blueprint - The blueprint containing children.
     */
    static _manifestChildren(el, blueprint) {
        if (blueprint.text) {
            el.textContent = blueprint.text;
        } else if (blueprint.html) {
            el.innerHTML = blueprint.html;
        } else if (blueprint.children) {
            el.appendChild(this.speak(blueprint.children));
        }
    }
}
