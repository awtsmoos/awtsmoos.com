
/**
 * B"H
 * @module BlueprintManifestor
 * @chapter Let there be form
 * @description
 * This module is the Voice of manifestation for the comments system.
 * It takes Blueprints (JSON Reshimu) and converts them into the 
 * physical world of the Browser (DOM).
 */

export class BlueprintManifestor {
    /**
     * @method manifest
     * @description The Divine command to appear.
     * @param {Object|string} plan - The Reshimu of the element.
     */
    static manifest(plan) {
        if (!plan) return document.createTextNode("");
        if (typeof plan === 'string' || typeof plan === 'number') {
            return document.createTextNode(String(plan));
        }

        const vessel = document.createElement(plan.tag);

        // 1. Boundries (Attributes)
        if (plan.attr) {
            Object.entries(plan.attr).forEach(([key, val]) => {
                if (val === true) vessel.setAttribute(key, "");
                else if (val !== undefined && val !== false) vessel.setAttribute(key, val);
            });
        }

        // 2. Logic (Events)
        if (plan.events) {
            Object.entries(plan.events).forEach(([evt, ritual]) => {
                if (typeof ritual === 'function') {
                    vessel.addEventListener(evt, ritual);
                }
            });
        }

        // 3. Life (Children)
        if (plan.children && Array.isArray(plan.children)) {
            plan.children.forEach(childPlan => {
                if (childPlan) vessel.appendChild(this.manifest(childPlan));
            });
        }

        return vessel;
    }
}
