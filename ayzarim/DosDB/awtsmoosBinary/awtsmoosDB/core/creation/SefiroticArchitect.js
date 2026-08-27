
// B"H
/**
 * @module SefiroticArchitect
 * @description
 * The Supreme Transformer of JSON Thought into DOM Form.
 *
 * This module is the singular point of manifestation. It converts the 
 * JSON blueprints of the spiritual realm into the living DOM nodes of 
 * the physical world. It utterly rejects raw HTML strings in favor of 
 * native Node hierarchy, preserving event closures and state purity.
 */

export const Architect = {
    /**
     * B"H
     * The Singular Command of Manifestation.
     * @param {object|Array|string|Node} intent - The spiritual blueprint.
     * @returns {Node|DocumentFragment} The manifested physical vessel.
     */
    render(intent) {
        if (intent === undefined || intent === null || intent === false) {
            return document.createTextNode('');
        }
        
        if (intent instanceof Node) return intent;

        if (Array.isArray(intent)) {
            const frag = document.createDocumentFragment();
            intent.forEach(spark => {
                if (spark) frag.appendChild(this.render(spark));
            });
            return frag;
        }

        if (typeof intent === 'string' || typeof intent === 'number') {
            return document.createTextNode(intent.toString());
        }

        // Creating the physical Vessel
        const el = document.createElement(intent.tag || 'div');

        // Apply Garments (Classes and ID)
        if (intent.id) el.id = intent.id;
        if (intent.className) el.className = intent.className;
        
        // Dataset (Metadata)
        if (intent.dataset) {
            Object.entries(intent.dataset).forEach(([k, v]) => {
                if (v !== undefined && v !== null) el.dataset[k] = v;
            });
        }

        // Inline Style Garments
        if (intent.style) {
            Object.assign(el.style, intent.style);
        }

        // Direct Properties
        const standardProps = ['src', 'alt', 'placeholder', 'type', 'value', 'rows', 'accept'];
        standardProps.forEach(p => {
            if (intent[p] !== undefined) el[p] = intent[p];
        });
        
        // Custom Attributes
        if (intent.attr) {
            Object.entries(intent.attr).forEach(([k, v]) => {
                if (v !== undefined && v !== null) el.setAttribute(k, v);
            });
        }

        // B"H - Implicit Event Listeners (No more onclick strings!)
        if (intent.on) {
            Object.entries(intent.on).forEach(([evt, handler]) => {
                if (typeof handler === 'function') {
                    el.addEventListener(evt, (e) => {
                        // Prevent default for standard actions to maintain SPA purity
                        if (['click', 'submit'].includes(evt) && !intent.allowDefault) {
                            // e.preventDefault(); 
                        }
                        handler(e);
                    });
                }
            });
        }

        // Recursive Manifestation of the Soul
        if (intent.html) {
            if (typeof intent.html === 'object') {
                el.appendChild(this.render(intent.html));
            } else {
                el.innerHTML = intent.html; 
            }
        } else if (intent.text) {
            el.textContent = intent.text;
        } else if (intent.children) {
            el.appendChild(this.render(intent.children));
        }

        return el;
    }
};
