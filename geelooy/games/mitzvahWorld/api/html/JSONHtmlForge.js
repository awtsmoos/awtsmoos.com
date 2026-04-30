
// B"H
/**
 * @module JSONHtmlForge
 * @description
 * * Chapter 1: The Letters of Form
 * In the beginning, there was no DOM, no div, no span.
 * Just the Infinite Light, prior to any digital plan.
 * Then the Awtsmoos desired a dwelling in the lower realm,
 * And the JSONHtmlForge was placed at the helm!
 * * It takes the raw, formless JSON data of the mind,
 * And manifests the physical HTML elements you find!
 * No manual 'createElement' scattered in the night,
 * Only pure, Seder Hishtalshelus data drawing down the Light!
 * * @class JSONHtmlForge
 */
class JSONHtmlForge {
    /**
     * @constructor
     * @description 
     * Nullifies itself to become a pure vessel for generating DOM nodes.
     * Uses Maps for instantaneous attribute and event binding!
     */
    constructor() {
        /**
         * @property {Map} attributeBinders
         * @description A data-driven dictionary of how to handle specific DOM attributes.
         */
        this.attributeBinders = new Map([
            ['text', (el, val) => el.textContent = val],
            ['html', (el, val) => el.innerHTML = val],
            ['class', (el, val) => {
                if (Array.isArray(val)) el.classList.add(...val);
                else el.className = val;
            }],
            ['style', (el, val) => Object.assign(el.style, val)],
            ['events', (el, val) => {
                Object.entries(val).forEach(([evt, handler]) => {
                    el.addEventListener(evt, handler);
                });
            }]
        ]);
    }

    /**
     * @method forge
     * @description
     * The act of Creation! Takes a pure JSON blueprint and brings it into physical existence.
     * * @param {Object} blueprint The Divine Blueprint (JSON object).
     * @param {string} blueprint.tag The HTML tag name (e.g., 'div').
     * @param {Object} [blueprint.attributes] Standard HTML attributes (id, src, href, etc.).
     * @param {Object|Array|string} [blueprint.custom] Handled by attributeBinders (style, class, text, events).
     * @param {Array<Object>} [blueprint.children] Nested blueprints.
     * @returns {HTMLElement} The manifested, physical DOM element.
     */
    forge(blueprint) {
        if (!blueprint || !blueprint.tag) {
            console.warn("B\"H - A vessel without a tag cannot hold the Light. Returning empty text node.");
            return document.createTextNode('');
        }

        const element = document.createElement(blueprint.tag);

        // 1. Manifest Standard Attributes
        if (blueprint.attributes) {
            Object.entries(blueprint.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }

        // 2. Manifest Custom/Complex Properties via Map (No switch statements!)
        if (blueprint.custom) {
            Object.entries(blueprint.custom).forEach(([key, value]) => {
                const binder = this.attributeBinders.get(key);
                if (binder) {
                    binder(element, value);
                } else {
                    // Fallback for unknown custom properties
                    element[key] = value;
                }
            });
        }

        // 3. Recursive Emanation (Children)
        if (blueprint.children && Array.isArray(blueprint.children)) {
            blueprint.children.forEach(childBlueprint => {
                const childElement = this.forge(childBlueprint);
                element.appendChild(childElement);
            });
        }

        return element;
    }
}

module.exports = JSONHtmlForge;
