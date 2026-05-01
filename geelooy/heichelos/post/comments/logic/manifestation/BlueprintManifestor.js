
/**
 * B"H
 * @module BlueprintManifestor
 * @chapter Let there be form
 * @description
 * Just as the Essence of the Creator — the Awtsmoos — speaks the world
 * into existence every moment using the 22 letters of the holy Hebrew tongue,
 * this module speaks the user interface into being using the letters of JSON.
 * It takes the potentiality (Blueprints) and manifests them as actual 
 * physical vessels (DOM Elements) in the browser's firmament.
 */

/**
 * @class BlueprintManifestor
 * @description The Sovereign Manifestation Engine.
 */
export class BlueprintManifestor {
    /**
     * @method manifest
     * @description
     * A ritual to convert a Reshimu plan into a physicalized revelation.
     * It recursively descends through the blueprint, weaving attributes, 
     * igniting event listeners, and anchoring references.
     * 
     * @param {Object|string|number} plan - The divine blueprint for the vessel.
     * @returns {HTMLElement|Text} - The physical result of the speech.
     */
    static manifest(plan) {
        // B"H - Strings and numbers are manifest as pure sparks of text
        if (typeof plan === 'string' || typeof plan === 'number') {
            return document.createTextNode(String(plan));
        }

        if (!plan || !plan.tag) {
            console.warn("B\"H - A blueprint without a tag is a shadow without a source.", plan);
            return document.createTextNode("");
        }

        // B"H - Create the primordial vessel from the tag name
        const vessel = document.createElement(plan.tag);

        // 1. Weave the Attributes (Borders of Being)
        if (plan.attr) {
            this._applyAttributes(vessel, plan.attr);
        }

        // 2. Ignite the Events (The Logic of the Soul)
        if (plan.events) {
            this._igniteEvents(vessel, plan.events);
        }

        // 3. Manifest the Children (Descending Seder Histalshelus)
        if (plan.children && Array.isArray(plan.children)) {
            plan.children.forEach(childPlan => {
                if (childPlan) {
                    const child = this.manifest(childPlan);
                    vessel.appendChild(child);
                }
            });
        }

        // 4. Anchor the Reference (Naming of Being)
        if (plan.ref && window.awtsmoosRefs) {
            window.awtsmoosRefs[plan.ref] = vessel;
        }

        return vessel;
    }

    /**
     * @private
     * @method _applyAttributes
     */
    static _applyAttributes(vessel, attrs) {
        Object.entries(attrs).forEach(([key, val]) => {
            if (key === 'style' && typeof val === 'object') {
                Object.assign(vessel.style, val);
            } else if (val !== undefined && val !== null) {
                if (val === true) vessel.setAttribute(key, "");
                else if (val !== false) vessel.setAttribute(key, val);
            }
        });
    }

    /**
     * @private
     * @method _igniteEvents
     */
    static _igniteEvents(vessel, events) {
        Object.entries(events).forEach(([evt, handler]) => {
            if (typeof handler === 'function') {
                vessel.addEventListener(evt, handler);
            }
        });
    }
}
