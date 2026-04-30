
/**
 * @module SefiraOfInput
 * @description
 * ⚖️ CHAPTER 2: THE REFINEMENT OF SIGNAL ⚖️
 * 
 * "He separates between light and darkness, between the holy and the mundane."
 * When the soul clicks the screen, we must precisely determine if the intent 
 * is meant for the 2D UI Garments or the 3D World Body. 
 * 
 * THE TIKKUN (RECTIFICATION):
 * The previous logic was too broad; it blocked clicks on the invisible background divs 
 * that overlay the canvas. We now use an exact, targeted Array of CSS Selectors 
 * to represent the "Klipot" (UI elements). If the click is not on one of these, 
 * the camera is free to rotate!
 */

export default class SefiraOfInput {
    /**
     * @method isUI
     * @description Checks the physical identity of an element with precise authority.
     * @param {HTMLElement} el - The DOM element touched.
     * @returns {boolean} True if it is a UI element, false if it is the void.
     */
    static isUI(el) {
        if (!el) return false;
        if (el.tagName === "CANVAS") return false;

        // B"H: The definitive list of Sacred Garments (UI Elements)
        const UI_MARKERS =[
            'button', 'input', 'textarea', 'select',
            '.mitzvahBtn', '.awtsmoosBtn', '.slotBtn', '.actionSlot', 
            '.equip-slot', '.ctx-btn', '.store-item', '.gameMenu', 
            '.gameHUD', '.quest-log', '.characterDesigner', 
            '.visual-editor', '.api-key-modal', '.dialogue',
            '[awtsmoosClick="true"]', '.menuTop', '.loginHeader',
            '.lava-menu', '.sg-glass-panel'
        ];

        // If the element itself or any of its ancestors match a UI marker, it is UI!
        const hit = el.closest(UI_MARKERS.join(', '));
        
        return !!hit;
    }

    /**
     * @method cleanseEvent
     * @description Strips physical DOM references so they can cross the Thread Abyss safely.
     * @param {Event} e - The DOM event.
     * @returns {Object} A purified JSON object.
     */
    static cleanseEvent(e) {
        if (!e) return null;
        
        const packet = {
            type: e.type,
            timeStamp: e.timeStamp,
            isOverUI: this.isUI(e.target)
        };

        if (e instanceof MouseEvent || (e.touches && e.touches.length)) {
            const src = e.touches ? e.touches[0] : e;
            packet.clientX = src.clientX;
            packet.clientY = src.clientY;
            packet.button = e.button;
            packet.movementX = e.movementX || 0;
            packet.movementY = e.movementY || 0;
        }

        if (e.code) {
            packet.code = e.code;
            packet.key = e.key;
            packet.shiftKey = e.shiftKey;
        }

        if (e.deltaY !== undefined) {
             packet.deltaY = e.deltaY;
        }

        return packet;
    }
}
