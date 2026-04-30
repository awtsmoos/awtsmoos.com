
// B"H
/**
 * @file SefiraOfInput.js
 * @description
 * ⚖️ THE CHAPTER OF DISCERNMENT (BINAH) ⚖️
 * 
 * Chapter 3: The Boundaries of Interactivity.
 * 
 * "And G-d separated the Light from the Darkness." 
 * To have a functional world, we must distinguish between the 
 * Interactive Garment (UI) and the Essential Space (3D World).
 * 
 * This module provides the logic to detect if a physical touch 
 * is landing on an actionable vessel (Button, Input, Joystick) 
 * or if it is landing in the "Open Space" of the UI layer, 
 * which should be treated as a direct touch on the 3D void.
 */
 
export default class SefiraOfInput {
 
    /**
     * @method isUI
     * @description
     * Determines if a DOM element is part of the "Active UI" or just 
     * a transparent container layer.
     * 
     * @param {HTMLElement|EventTarget} el - The element to judge.
     * @returns {boolean} True if the element should block world interactions.
     */
    static isUI(el) {
        if (!el || !el.closest) return false;

        // B"H: The Decree of Actionable Vessels.
        // If the element (or its parents) matches these markers, it is a UI event.
        const UI_MARKERS = [
            'button', 'a', 'input', 'select', 'textarea',
            '.awtsmoosBtn', '.mitzvahBtn', '.controller-button', 
            '.ctx-btn', '#joystick-container', '.inventory-slot',
            '.gameMenu', '.store-container', '.quest-log'
        ];

        // Search upward through the Seder Hishtalshelus of the DOM
        return !!el.closest(UI_MARKERS.join(', '));
    }
 
    /**
     * @method cleanseEvent
     * @description
     * Transforms a heavy, un-serializable DOM event into a pure light 
     * of JSON data safe for the Tzimtzum of postMessage.
     */
    static cleanseEvent(e) {
        if (!e) return null;
 
        const packet = {
            type: e.type,
            timeStamp: e.timeStamp,
            isOverUI: this.isUI(e.target)
        };
 
        // 1. Physical Coordinates (Mouse/Touch)
        if (e.clientX !== undefined || (e.touches && e.touches.length)) {
            const src = (e.touches && e.touches.length) ? e.touches[0] : e;
            packet.clientX = src.clientX;
            packet.clientY = src.clientY;
            packet.pageX = src.pageX;
            packet.pageY = src.pageY;
            packet.button = e.button !== undefined ? e.button : 0;
            packet.movementX = e.movementX || 0;
            packet.movementY = e.movementY || 0;
        }
 
        // 2. Intellectual Input (Keyboard)
        if (e.code !== undefined) {
            packet.code = e.code;
            packet.key = e.key;
        }
 
        // 3. Depth Alteration (Wheel)
        if (e.deltaY !== undefined) {
            packet.deltaY = e.deltaY;
        }
 
        return packet;
    }
}
