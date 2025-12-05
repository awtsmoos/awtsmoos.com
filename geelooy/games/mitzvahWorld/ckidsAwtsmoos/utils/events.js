/**
 * B"H
 * Event Utilities
 */
export default class EventUtils {
    static clone(event) {
        if(event instanceof KeyboardEvent) {
            return {
                isTrusted: event.isTrusted, key: event.key, code: event.code, location: event.location,
                ctrlKey: event.ctrlKey, shiftKey: event.shiftKey, altKey: event.altKey, metaKey: event.metaKey,
                repeat: event.repeat, isComposing: event.isComposing, charCode: event.charCode, keyCode: event.keyCode,
                which: event.which, type: event.type, timeStamp: event.timeStamp
            };
        }
        if(event instanceof MouseEvent) {
            return {
                isTrusted: event.isTrusted, screenX: event.screenX, screenY: event.screenY, clientX: event.clientX, clientY: event.clientY,
                ctrlKey: event.ctrlKey, shiftKey: event.shiftKey, altKey: event.altKey, metaKey: event.metaKey,
                movementX: event.movementX, movementY: event.movementY, button: event.button, buttons: event.buttons,
                relatedTarget: event.relatedTarget, region: event.region, type: event.type, timeStamp: event.timeStamp,
                deltaX: event.deltaX, deltaY: event.deltaY, deltaZ: event.deltaZ, deltaMode: event.deltaMode
            };
        }
        if(event instanceof WheelEvent) {
            return {
                isTrusted: event.isTrusted, screenX: event.screenX, screenY: event.screenY, clientX: event.clientX, clientY: event.clientY,
                ctrlKey: event.ctrlKey, shiftKey: event.shiftKey, altKey: event.altKey, metaKey: event.metaKey,
                button: event.button, buttons: event.buttons, relatedTarget: event.relatedTarget, region: event.region,
                deltaX: event.deltaX, deltaY: event.deltaY, deltaZ: event.deltaZ, deltaMode: event.deltaMode,
                type: event.type, timeStamp: event.timeStamp
            };
        }
        if(event instanceof Touch) {
            return {
                screenX: event.screenX, screenY: event.screenY, clientX: event.clientX, clientY: event.clientY,
                radiusX: event.radiusX, radiusY: event.radiusY, deltaX: event.screenX, deltaY: event.screenY
            };
        }
        return {};
    }
}