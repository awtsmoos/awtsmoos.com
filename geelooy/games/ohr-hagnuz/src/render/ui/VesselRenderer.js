
/**
 * B"H
 * @class VesselRenderer
 * @chapter The Purification of Containers
 */
export class VesselRenderer {
    /**
     * @description Clears a container and prepares it for new generations.
     */
    static purge(id) {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
        return el;
    }

    /**
     * @description Appends a styled child to a vessel.
     */
    static imbue(parent, tag, className, text) {
        const child = document.createElement(tag);
        if (className) child.className = className;
        if (text) child.innerText = text;
        parent.appendChild(child);
        return child;
    }
}
