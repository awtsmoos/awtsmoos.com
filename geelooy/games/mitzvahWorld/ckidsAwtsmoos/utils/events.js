//B"H
/**
 * EventUtils - Sacred translators between the physical user actions and the spiritual worker logic.
 */
export default class EventUtils {
    /**
     * Clones a native browser event into a serializable object for the Worker.
     * @param {Event} event - The physical event to be translated.
     * @returns {Object} The translated essence of the event.
     */
    static clone(event) {
        if (!event) return {};

        const base = {
            isTrusted: event.isTrusted,
            timeStamp: event.timeStamp,
            type: event.type
        };

        // B"H: Priority - WheelEvent must be handled before MouseEvent as it inherits from it.
        if (event instanceof WheelEvent || event.type === 'wheel') {
            return {
                ...base,
                screenX: event.screenX,
                screenY: event.screenY,
                clientX: event.clientX,
                clientY: event.clientY,
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey,
                altKey: event.altKey,
                metaKey: event.metaKey,
                button: event.button,
                buttons: event.buttons,
                deltaX: event.deltaX,
                deltaY: event.deltaY, // CRITICAL: The spark of zoom intensity
                deltaZ: event.deltaZ,
                deltaMode: event.deltaMode
            };
        }

        if (event instanceof KeyboardEvent || event.type === 'keydown' || event.type === 'keyup') {
            return {
                ...base,
                key: event.key,
                code: event.code,
                location: event.location,
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey,
                altKey: event.altKey,
                metaKey: event.metaKey,
                repeat: event.repeat,
                isComposing: event.isComposing,
                charCode: event.charCode,
                keyCode: event.keyCode,
                which: event.which
            };
        }

        if (event instanceof MouseEvent || event.type === 'mousedown' || event.type === 'mouseup' || event.type === 'mousemove' || event.type === 'click') {
            return {
                ...base,
                screenX: event.screenX,
                screenY: event.screenY,
                clientX: event.clientX,
                clientY: event.clientY,
                ctrlKey: event.ctrlKey,
                shiftKey: event.shiftKey,
                altKey: event.altKey,
                metaKey: event.metaKey,
                movementX: event.movementX,
                movementY: event.movementY,
                button: event.button,
                buttons: event.buttons,
                relatedTarget: null,
                region: event.region
            };
        }
        
        if (typeof Touch !== "undefined" && event instanceof Touch) {
             return {
                screenX: event.screenX,
                screenY: event.screenY,
                clientX: event.clientX,
                clientY: event.clientY,
                radiusX: event.radiusX,
                radiusY: event.radiusY, 
                identifier: event.identifier,
                target: null
            };
        }
        
        return base;
    }
}