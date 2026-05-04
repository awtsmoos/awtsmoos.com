
/**
 * B"H
 * UnderstandingGenerator: The Engine of Formation.
 * 
 * Poetic Story: The Weaver of Worlds.
 * In the high world of Bina, the plans are drawn.
 * This class takes those plans and, like a diligent weaver, 
 * draws them down thread by thread until a physical vessel 
 * exists where previously there was only thought.
 */
export class UnderstandingGenerator {
    /**
     * Materializes a JSON Blueprint into an HTMLElement.
     * 
     * @param {Object} plan - Structural definition.
     * @param {string} plan.t - Tag name.
     * @param {Object} plan.a - Attributes and Styles.
     * @param {Array} plan.c - Offspring nodes.
     * @returns {HTMLElement} The physically manifest node.
     */
    static realize(plan) {
        if (!plan || !plan.t) return null;

        const node = document.createElement(plan.t);

        if (plan.a) {
            Object.entries(plan.a).forEach(([key, val]) => {
                this.imbue(node, key, val);
            });
        }

        if (plan.text) node.innerText = plan.text;

        if (plan.c && Array.isArray(plan.c)) {
            plan.c.forEach(seed => {
                const child = this.realize(seed);
                if (child) node.appendChild(child);
            });
        }

        return node;
    }

    /**
     * B"H
     * Imbues the vessel with characteristics.
     * @private
     */
    static imbue(node, key, val) {
        if (key === 'style' && typeof val === 'object') {
            Object.assign(node.style, val);
        } else if (key === 'class') {
            node.className = val;
        } else {
            node.setAttribute(key, val);
        }
    }
}
