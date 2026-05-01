
/**
 * B"H
 * @module GenesisEngine
 * @chapter The Scribe of Manifestation
 * @description
 * "By the Word of God the heavens were made."
 * Raw HTML strings are chaotic and prone to shattering. This engine takes 
 * organized, structured JSON Blueprints (representing the Sefirot) and 
 * breathes life into them, returning pure, manifest DOM Elements.
 */

export class GenesisEngine {
    /**
     * @method manifest
     * @description 
     * The core ritual of creation. Recursively descends through the blueprint.
     * @param {Object|string|Array} plan - The divine blueprint.
     * @returns {Node} - The physicalized DOM Node.
     */
    static manifest(plan) {
        // 1. The Void
        if (plan === null || plan === undefined) {
            return document.createTextNode("");
        }

        // 2. The Pure Spark (Text)
        if (typeof plan === 'string' || typeof plan === 'number') {
            return document.createTextNode(String(plan));
        }

        // 3. The Multitude (Array of Blueprints)
        if (Array.isArray(plan)) {
            const fragment = document.createDocumentFragment();
            plan.forEach(spark => {
                if (spark) fragment.appendChild(this.manifest(spark));
            });
            return fragment;
        }

        // 4. The Structured Vessel (Object)
        if (!plan.tag) {
            console.warn("B\"H - Genesis Engine encountered a vessel without a Name (tag):", plan);
            return document.createTextNode("");
        }

        const vessel = document.createElement(plan.tag);

        // A. Define the Boundaries (Attributes)
        if (plan.attr) {
            Object.entries(plan.attr).forEach(([key, val]) => {
                if (key === 'style' && typeof val === 'object') {
                    Object.assign(vessel.style, val);
                } else if (key === 'class' || key === 'className') {
                    vessel.className = val;
                } else if (val === true) {
                    vessel.setAttribute(key, "");
                } else if (val !== false && val !== null && val !== undefined) {
                    vessel.setAttribute(key, val);
                }
            });
        }

        // B. Ignite the Soul (Events)
        if (plan.events) {
            Object.entries(plan.events).forEach(([evtName, ritual]) => {
                if (typeof ritual === 'function') {
                    vessel.addEventListener(evtName, ritual);
                }
            });
        }

        // C. Populate the Vessel (Children)
        if (plan.children) {
            const children = Array.isArray(plan.children) ? plan.children : [plan.children];
            children.forEach(childPlan => {
                if (childPlan) vessel.appendChild(this.manifest(childPlan));
            });
        }

        // D. Direct Text Injection
        if (plan.text) {
            vessel.appendChild(document.createTextNode(plan.text));
        }

        // E. Direct HTML Injection (Only for user-generated Markdown/HTML)
        if (plan.html) {
            vessel.innerHTML = plan.html;
        }

        // F. Anchor the Name (Ref)
        if (plan.ref && window.awtsmoosRefs) {
            window.awtsmoosRefs[plan.ref] = vessel;
        }

        return vessel;
    }
}
