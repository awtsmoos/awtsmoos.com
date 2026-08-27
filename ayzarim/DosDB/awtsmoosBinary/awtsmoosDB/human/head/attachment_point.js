
/**
 * @file attachment_point.js
 * @description
 * The Head is the Chochma, the point of wisdom.
 * For a Hat to exist, it must find a 'Place' (Makom) within the dimensions of the Head.
 * 
 * This module manages the Seder (Order) of multiple attachments.
 */

import { HeadwearFactory } from '../headwear/registry.js';

export class AttachmentPoint {
    /**
     * @constructor
     * @param {HTMLElement} headElement - The physical head vessel.
     */
    constructor(headElement) {
        this.container = headElement;
        this.attachments = new Map();
    }

    /**
     * @description 
     * Attaches a new item of Headwear to the Head.
     * The item is created via the Factory and then rendered into the container.
     * 
     * @param {string} id - Unique ID for this specific attachment instance.
     * @param {string} type - The archetype (e.g., 'yarmulke').
     * @param {Object} props - Visual and spatial properties.
     */
    attach(id, type, props) {
        const component = HeadwearFactory.create(type, props);
        if (component) {
            const dom = component.render();
            this.container.appendChild(dom);
            this.attachments.set(id, { component, dom });
        }
    }

    /**
     * @description Removes an attachment, returning it to the void.
     * @param {string} id - The instance ID.
     */
    detach(id) {
        const item = this.attachments.get(id);
        if (item) {
            item.dom.remove();
            this.attachments.delete(id);
        }
    }
}
