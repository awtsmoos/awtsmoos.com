/**
 * B"H
 * Event Utilities
 */
export default class EventUtils {
    static clone(event) {
        if (!event) return {};

        const base = {
            isTrusted: event.isTrusted,
            timeStamp: event.timeStamp,
            type: event.type
        };

        if(event instanceof KeyboardEvent || event.type === 'keydown' || event.type === 'keyup') {
            return {
                ...base,
                key: event.key, code: event.code, location: event.location,
                ctrlKey: event.ctrlKey, shiftKey: event.shiftKey, altKey: event.altKey, metaKey: event.metaKey,
                repeat: event.repeat, isComposing: event.isComposing, charCode: event.charCode, keyCode: event.keyCode,
                which: event.which
            };
        }

        // B"H FIX: WheelEvent check MUST come before MouseEvent because WheelEvent inherits from MouseEvent.
        // Otherwise, it gets caught by the MouseEvent block which doesn't clone deltaY.
        if(event instanceof WheelEvent || event.type === 'wheel') {
            return {
                ...base,
                screenX: event.screenX, screenY: event.screenY, clientX: event.clientX, clientY: event.clientY,
                ctrlKey: event.ctrlKey, shiftKey: event.shiftKey, altKey: event.altKey, metaKey: event.metaKey,
                button: event.button, buttons: event.buttons,
                deltaX: event.deltaX, deltaY: event.deltaY, deltaZ: event.deltaZ, deltaMode: event.deltaMode
            };
        }

        if(event instanceof MouseEvent || event.type === 'mousedown' || event.type === 'mouseup' || event.type === 'mousemove' || event.type === 'click') {
            return {
                ...base,
                screenX: event.screenX, screenY: event.screenY, clientX: event.clientX, clientY: event.clientY,
                ctrlKey: event.ctrlKey, shiftKey: event.shiftKey, altKey: event.altKey, metaKey: event.metaKey,
                movementX: event.movementX, movementY: event.movementY, button: event.button, buttons: event.buttons,
                relatedTarget: null, // Avoid circular structure
                region: event.region
            };
        }
        
        if(typeof Touch !== "undefined" && event instanceof Touch) {
             return {
                screenX: event.screenX, screenY: event.screenY, clientX: event.clientX, clientY: event.clientY,
                radiusX: event.radiusX, radiusY: event.radiusY, 
                identifier: event.identifier,
                target: null // Avoid circular
            };
        }
        
        // Fallback for generic object-like events
        return base;
    }
}