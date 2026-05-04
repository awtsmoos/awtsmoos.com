
/**
 * B"H
 * @module DOMManifestor
 * @description
 * Just as the Awtsmoos constantly recreates all of existence from nothing, 
 * uttering the 10 statements of creation every single instant, this module 
 * takes pure intent (JSON data) and speaks it into the physical form of the DOM.
 * There are no placeholders, no raw HTML strings to shatter—only pure manifestation.
 */

export class DOMManifestor {
    /**
     * @method create
     * @description Recursively builds a physical DOM node from a data plan.
     */
    static create(plan) {
        if (typeof plan === 'string' || typeof plan === 'number') {
            return document.createTextNode(String(plan));
        }

        if (!plan || !plan.tag) {
            return document.createTextNode("");
        }

        const el = document.createElement(plan.tag);

        if (plan.className) el.className = plan.className;
        if (plan.id) el.id = plan.id;
        if (plan.href) el.href = plan.href;
        if (plan.onclick) el.onclick = plan.onclick;
        
        // B"H - Inject HTML if provided (safe usage only)
        if (plan.innerHTML) el.innerHTML = plan.innerHTML;
        if (plan.innerText) el.innerText = plan.innerText;

        if (plan.children && Array.isArray(plan.children)) {
            plan.children.forEach(child => {
                const childNode = this.create(child);
                if(childNode) el.appendChild(childNode);
            });
        }

        return el;
    }
}
