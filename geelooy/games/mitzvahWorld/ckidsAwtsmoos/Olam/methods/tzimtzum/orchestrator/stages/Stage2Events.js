
/**
 * B"H
 * @module Stage2Events
 * @description
 * Binding the abstract laws of nature to the active world instance.
 */
export default class Stage2Events {
    static bind(olam, info) {
        if (info.on) {
            // B"H: silent

            Object.keys(info.on).forEach(q => olam.on(q, info.on[q]));
        }

        // B"H: The Decree of Perception - Mirroring the Worker's intent in the Physical DOM
        olam.on("set cursor", (cursor) => {
            document.body.style.cursor = cursor;
        });
    }
}
