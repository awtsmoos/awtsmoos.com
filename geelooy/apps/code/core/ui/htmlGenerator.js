
// B"H
/**
 * @file htmlGenerator.js
 * @brief THE ARCHITECTURE OF REVELATION.
 * 
 * POEM OF THE MANIFESTOR:
 * Out of the thought, the JSON descends,
 * Into the DOM where the darkness ends.
 * We name the tag, we set the style,
 * Building the world in a sacred while.
 * Every attribute, a spark in the frame,
 * Every child-node, a praise of His name.
 */

/**
 * @class HTMLGenerator
 * @description Translates the hidden potential of data into the revealed reality of the user interface.
 */
export class HTMLGenerator {
    /**
     * B"H - Creates a physical element from a spiritual data-map.
     * @param {object} schema - The blueprint of the vessel (tag, props, style, children).
     * @returns {HTMLElement} The manifested object of creation.
     */
    static generate(schema) {
        if (!schema) return null;
        if (typeof schema === 'string' || typeof schema === 'number') {
            return document.createTextNode(String(schema));
        }
        if (schema instanceof HTMLElement) return schema;

        const el = document.createElement(schema.tag || 'div');

        // Apply identity and lineage
        if (schema.id) el.id = schema.id;
        if (schema.className) el.className = schema.className;
        if (schema.text) el.textContent = schema.text;
        if (schema.html) el.innerHTML = schema.html;

        // B"H - Apply the Garments of Style
        if (schema.style) {
            Object.assign(el.style, schema.style);
        }

        // B"H - Apply the Seals of Attribute
        if (schema.attributes) {
            Object.entries(schema.attributes).forEach(([key, val]) => {
                el.setAttribute(key, val);
            });
        }

        // B"H - Apply the Responses of Action
        if (schema.events) {
            Object.entries(schema.events).forEach(([ev, handler]) => {
                el.addEventListener(ev, handler);
            });
        }

        // B"H - Manifest the Descendants
        if (schema.children && Array.isArray(schema.children)) {
            schema.children.forEach(child => {
                const childNode = this.generate(child);
                if (childNode) el.appendChild(childNode);
            });
        }

        return el;
    }
}

/**
 * B"H - Short-hand invocation for the Architect.
 */
export const HTML = (schema) => HTMLGenerator.generate(schema);
