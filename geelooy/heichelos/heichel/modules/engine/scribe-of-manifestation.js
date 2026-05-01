
/**
 * B"H
 * @module GenesisEngine
 * @description
 * "Let there be form." This module is the Scribe of the Awtsmoos. 
 * It takes the blueprints of light (JSON Data) and weaves them 
 * into the tapestry of the manifest world (DOM). 
 * Each 'tag' is a Sefirah, each 'attr' is a boundary, and 
 * each 'child' is a descending level of complexity.
 */

import { DOMElements } from '../registry/dom-store.js';

/**
 * @class ScribeOfManifestation
 * @description The holy architect responsible for Speaking the UI into being.
 */
export class ScribeOfManifestation {
    /**
     * @method speakElement
     * @description
     * Converts a single blueprint into a living DOM entity. 
     * Recursively calls itself to manifest all children.
     * @param {Object|string|number} plan - The JSON definition or a raw text string.
     * @returns {HTMLElement|Text} - The physicalized revelation.
     */
    static speakElement(plan) {
        // B"H - Strings and numbers are manifest as pure sparks of text
        if (typeof plan === 'string' || typeof plan === 'number') {
            return document.createTextNode(String(plan));
        }

        if (!plan || !plan.tag) {
            console.warn("B\"H - A blueprint without a tag is a shadow without a source.", plan);
            return document.createTextNode("");
        }

        // B"H - Create the primordial vessel
        const vessel = document.createElement(plan.tag);

        // 1. Weave the Attributes (Borders of Being)
        if (plan.attr) {
            this.weaveAttributes(vessel, plan.attr);
        }

        // 2. Ignite the Events (The Logic of the Soul)
        if (plan.events) {
            this.igniteEvents(vessel, plan.events);
        }

        // 3. Manifest the Children (Evolutionary Descent)
        if (plan.children && Array.isArray(plan.children)) {
            plan.children.forEach(childPlan => {
                if (childPlan) {
                    const child = this.speakElement(childPlan);
                    vessel.appendChild(child);
                }
            });
        }

        // 4. Anchor the Reference (The Remembrance of Name)
        if (plan.ref) {
            DOMElements[plan.ref] = vessel;
        }

        return vessel;
    }

    /**
     * @method manifest
     * @description Synonym for speakElement, providing the ritual of manifestation.
     */
    static manifest(plan) {
        return this.speakElement(plan);
    }

    /**
     * @private
     * @method weaveAttributes
     */
    static weaveAttributes(vessel, attrs) {
        Object.entries(attrs).forEach(([key, val]) => {
            if (key === 'style' && typeof val === 'object') {
                Object.assign(vessel.style, val);
            } else if (val !== undefined && val !== null) {
                // Handle boolean attributes like 'required' or 'disabled'
                if (val === true) vessel.setAttribute(key, "");
                else if (val !== false) vessel.setAttribute(key, val);
            }
        });
    }

    /**
     * @private
     * @method igniteEvents
     */
    static igniteEvents(vessel, events) {
        Object.entries(events).forEach(([evt, handler]) => {
            if (typeof handler === 'function') {
                vessel.addEventListener(evt, handler);
            }
        });
    }
}
